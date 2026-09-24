from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import uuid, datetime
from profile import get_current_user_email
from db import support_requests_collection

# TODO: Add real support team notification integration (e.g., email / Slack webhook trigger) on submission.

router = APIRouter()

class SupportRequestPayload(BaseModel):
    subject: str = Field(..., min_length=1)
    message: str = Field(..., min_length=10)

@router.post("/support/requests")
def submit_support_request(
    body: SupportRequestPayload,
    user_email: str = Depends(get_current_user_email)
):
    """Store support request from authenticated user in MongoDB."""
    request_id = str(uuid.uuid4())
    doc = {
        "request_id": request_id,
        "user_email": user_email,  # Sourced strictly from verified session cookie
        "subject": body.subject,
        "message": body.message,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "status": "open"
    }

    try:
        support_requests_collection.insert_one(doc)
    except Exception as db_err:
        print("MongoDB support request insert error:", str(db_err))

    print(f"SUPPORT_REQUEST: Created request '{request_id}' for user '{user_email}'.")
    return {
        "status": "received",
        "request_id": request_id
    }

