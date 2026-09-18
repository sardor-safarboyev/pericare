from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field

from app.domain.value_objects import BloodPressure, RiskLevel, Role


class BaseDomainEntity(BaseModel):
    # ORM modellarini to'g'ridan-to'g'ri Pydantic entity'ga aylantirishga ruxsat beradi
    model_config = ConfigDict(from_attributes=True)


class User(BaseDomainEntity):
    id: UUID = Field(default_factory=uuid4)
    email: str
    full_name: str
    role: Role
    district: Optional[str] = None
    is_active: bool = True


class Patient(BaseDomainEntity):
    id: UUID = Field(default_factory=uuid4)
    age: int = Field(..., gt=0, le=100)
    gestational_week: int = Field(..., ge=1, le=42)
    district: str
    history_hypertension: bool = False
    history_diabetes: bool = False
    history_preeclampsia: bool = False


class VitalsReading(BaseDomainEntity):
    id: UUID = Field(default_factory=uuid4)
    patient_id: UUID
    blood_pressure: BloodPressure
    recorded_by_id: UUID
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    proteinuria_level: str
    blood_sugar: Optional[float] = None
    body_temp: Optional[float] = None
    heart_rate: Optional[int] = Field(None, gt=0)


class RiskAssessment(BaseDomainEntity):
    id: UUID = Field(default_factory=uuid4)
    patient_id: UUID
    vitals_reading_id: UUID
    risk_level: RiskLevel
    top_features: Dict[str, Any] = Field(default_factory=dict)
    computed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
