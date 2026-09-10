from fastapi import APIRouter, HTTPException, Response, Depends, Cookie
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt, os, datetime

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = os.getenv("JWT_SECRET", "change-me")

class LoginRequest(BaseModel):
    email: str
    password: str

# Demo store — TODO: replace with a users_collection in db.py for production
FAKE_USER = {"email": "alex@example.com", "password": "password123", "name": "Alex J."}

@router.post("/auth/login")
def login(body: LoginRequest, response: Response):
    if body.email != FAKE_USER["email"] or body.password != FAKE_USER["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"sub": body.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)},
        SECRET, algorithm="HS256"
    )
    response.set_cookie("session", token, httponly=True, samesite="lax", max_age=8 * 3600)
    return {"name": FAKE_USER["name"], "email": FAKE_USER["email"]}

@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie("session")
    return {"status": "logged_out"}

@router.get("/auth/me")
def me(session: str | None = Cookie(default=None)):
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(session, SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session")
    return {"email": payload["sub"], "name": FAKE_USER["name"]}
