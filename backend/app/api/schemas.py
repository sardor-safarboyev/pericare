from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.value_objects.perinatal import (
    ActionTakenType,
    FacilityType,
    ObstetricSyndrome,
    ProteinuriaLevel,
    ReferralStatus,
    RiskZone,
    UserRole,
)


# Auth Schemas
class StaffRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str = Field(min_length=6)
    role: UserRole
    facility_id: UUID
    telegram_user_id: str | None = None


class StaffLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


# Facility & Patient Schemas
class FacilityResponse(BaseModel):
    id: UUID
    name: str
    facility_type: FacilityType
    district: str | None
    region: str


class PatientRegisterRequest(BaseModel):
    full_name: str
    pinfl: str | None = Field(default=None, max_length=14)
    age: int = Field(ge=12, le=60)
    gestational_week: int = Field(ge=1, le=45)
    home_facility_id: UUID
    district: str | None = None
    history_hypertension: bool = False
    history_preeclampsia: bool = False


class PatientResponse(BaseModel):
    id: UUID
    full_name: str
    age: int
    gestational_week: int
    district: str
    created_at: datetime


# Triage & Vitals Schemas
class TriageSubmitRequest(BaseModel):
    patient_id: UUID
    systolic_bp: int = Field(ge=50, le=280)
    diastolic_bp: int = Field(ge=30, le=180)
    heart_rate: int = Field(ge=30, le=220)
    body_temp: float = Field(default=36.6, ge=34.0, le=43.0)
    proteinuria: ProteinuriaLevel
    respiratory_rate: int = Field(default=18, ge=8, le=60)
    blood_sugar: float | None = Field(default=None, ge=1.0, le=35.0)
    raw_image_url: str | None = None


class TriageResponse(BaseModel):
    vitals_id: UUID
    assessment_id: UUID
    risk_zone: RiskZone
    syndrome: ObstetricSyndrome
    shock_index: float
    velocity_score: float
    top_factors: dict[str, Any]
    referral_id: UUID | None = None
    sla_expires_at: datetime | None = None


# Referral & Clinical Action
class ClinicalActionRequest(BaseModel):
    action_type: ActionTakenType
    notes: str = Field(min_length=3)


class ReferralResponse(BaseModel):
    id: UUID
    patient_id: UUID
    risk_assessment_id: UUID
    from_facility_id: UUID
    to_facility_id: UUID
    status: ReferralStatus
    sla_expires_at: datetime
    action_type: ActionTakenType | None
    action_notes: str | None
    created_at: datetime
    resolved_at: datetime | None


# Offline Sync
class SyncBatchRequest(BaseModel):
    records: list[dict[str, Any]]
