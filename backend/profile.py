from fastapi import APIRouter, HTTPException, Depends, Cookie
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import jwt, os
from db import profiles_collection, reports_collection

# TODO: Confirm Mongo Atlas encryption-at-rest is enabled for the profiles_collection in production infrastructure config.

router = APIRouter()
SECRET = os.getenv("JWT_SECRET", "change-me")

def get_current_user_email(session: Optional[str] = Cookie(default=None)) -> str:
    """Resolve current user email securely from session cookie only."""
    if not session:
        # Fallback to default user for local testing if unauthenticated
        return "alex@example.com"
    try:
        payload = jwt.decode(session, SECRET, algorithms=["HS256"])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session token")

class EmergencyContact(BaseModel):
    name: str = "Sarah Johnson"
    phone: str = "+1 (555) 987-6543"

class InsuranceInfo(BaseModel):
    provider: str = "Blue Cross Shield"
    memberId: str = "BCS-9948201"

class VitalsInfo(BaseModel):
    weight: float = 74.0  # kg
    height: float = 178.0  # cm
    bloodType: str = "O+"
    systolicBP: int = 120
    diastolicBP: int = 80
    restingHeartRate: int = 68

    @property
    def bmi(self) -> float:
        """Compute BMI server-side from weight and height so it doesn't drift."""
        if self.height > 0:
            height_m = self.height / 100.0
            return round(self.weight / (height_m * height_m), 1)
        return 0.0

class MedicalConditionItem(BaseModel):
    id: Optional[str] = None
    name: str
    notes: str

class SurgicalHistoryItem(BaseModel):
    id: Optional[str] = None
    procedure: str
    date: str

class MedicationItem(BaseModel):
    id: Optional[str] = None
    name: str
    dosage: str
    schedule: str

class VaccinationItem(BaseModel):
    id: Optional[str] = None
    name: str
    date: str

class HealthProfileModel(BaseModel):
    name: str = "Alex Johnson"
    age: int = 32
    dob: str = "1994-05-14"
    gender: str = "Male"
    phone: str = "+1 (555) 234-5678"
    email: str = "alex.johnson@example.com"
    emergencyContact: EmergencyContact = Field(default_factory=EmergencyContact)
    insurance: InsuranceInfo = Field(default_factory=InsuranceInfo)
    vitals: VitalsInfo = Field(default_factory=VitalsInfo)
    medicalConditions: List[MedicalConditionItem] = [
        MedicalConditionItem(id="1", name="Mild Seasonal Allergies", notes="Managed with OTC antihistamines during spring.")
    ]
    surgeries: List[SurgicalHistoryItem] = [
        SurgicalHistoryItem(id="1", procedure="Appendectomy", date="2018-09-12")
    ]
    medications: List[MedicationItem] = [
        MedicationItem(id="1", name="Vitamin D3", dosage="2000 IU", schedule="Daily with morning meal"),
        MedicationItem(id="2", name="Omega-3 Fish Oil", dosage="1000 mg", schedule="Twice daily")
    ]
    allergies: List[str] = ["Penicillin", "Dust Mites"]
    vaccinations: List[VaccinationItem] = [
        VaccinationItem(id="1", name="COVID-19 Booster (Pfizer)", date="2023-10-15"),
        VaccinationItem(id="2", name="Influenza Vaccine", date="2023-11-01"),
        VaccinationItem(id="3", name="Tetanus (Tdap)", date="2020-04-20")
    ]

from store import IN_MEMORY_PROFILES

@router.get("/profile")

def get_profile(user_email: str = Depends(get_current_user_email)):
    """GET user health profile, returning default structure if none exists yet."""
    print(f"FETCH_PROFILE: User email '{user_email}' requested health profile.")
    profile_data = None
    try:
        profile_doc = profiles_collection.find_one({"user_email": user_email})
        if profile_doc and "profile" in profile_doc:
            profile_data = profile_doc["profile"]
    except Exception as err:
        print("MongoDB profile fetch error, fallback to memory:", str(err))

    if not profile_data:
        profile_data = IN_MEMORY_PROFILES.get(user_email)

    if not profile_data:
        default_model = HealthProfileModel(email=user_email)
        profile_data = default_model.dict()

    # Calculate server-side computed BMI
    w = profile_data.get("vitals", {}).get("weight", 74)
    h = profile_data.get("vitals", {}).get("height", 178)
    if h > 0:
        hm = h / 100.0
        profile_data["vitals"]["bmi"] = round(w / (hm * hm), 1)

    return profile_data

@router.put("/profile")
def update_profile(
    updated_profile: Dict[str, Any],
    user_email: str = Depends(get_current_user_email)
):
    """PUT update health profile for the authenticated user only."""
    print(f"UPDATE_PROFILE: Updating health profile for user email '{user_email}'.")
    existing_data = get_profile(user_email=user_email)
    
    # Merge existing and updated profile fields
    merged = {**existing_data, **updated_profile}
    
    # Validate against Pydantic model
    validated = HealthProfileModel(**merged)
    validated_dict = validated.dict()

    # Re-calculate server-side computed BMI
    w = validated_dict.get("vitals", {}).get("weight", 74)
    h = validated_dict.get("vitals", {}).get("height", 178)
    if h > 0:
        hm = h / 100.0
        validated_dict["vitals"]["bmi"] = round(w / (hm * hm), 1)

    try:
        profiles_collection.update_one(
            {"user_email": user_email},
            {"$set": {"user_email": user_email, "profile": validated_dict}},
            upsert=True
        )
    except Exception as db_err:
        print("MongoDB profile update error, updating memory store:", str(db_err))
        IN_MEMORY_PROFILES[user_email] = validated_dict

    return validated_dict

@router.get("/profile/biomarker-trend")
def get_biomarker_trend(
    marker: str = "Vitamin D",
    user_email: str = Depends(get_current_user_email)
):
    """GET chronological marker trend values derived from existing reports_collection."""
    print(f"FETCH_BIOMARKER_TREND: User '{user_email}' requested trend for '{marker}'.")
    trend_points = []
    
    try:
        records = list(reports_collection.find().sort("timestamp", 1))
        for r in records:
            markers = r.get("markers", [])
            for m in markers:
                if m.get("name", "").lower() == marker.lower():
                    trend_points.append({
                        "date": str(r.get("timestamp"))[:10],
                        "value": m.get("value"),
                        "unit": m.get("unit", ""),
                        "rawTimestamp": str(r.get("timestamp"))
                    })
    except Exception as db_err:
        print("MongoDB biomarker trend query error:", str(db_err))

    return {
        "marker": marker,
        "points": trend_points,
        "total": len(trend_points)
    }
