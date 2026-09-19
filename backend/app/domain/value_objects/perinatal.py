from enum import Enum

from pydantic import BaseModel, Field, model_validator


class RiskZone(str, Enum):
    YASHIL = "yashil"
    SARIQ = "sariq"
    QIZIL = "qizil"


class ObstetricSyndrome(str, Enum):
    NORMAL = "normal"
    PREECLAMPSIA = "preeclampsia"
    HEMODYNAMIC_SHOCK = "hemodynamic_shock"
    SEPSIS_RISK = "sepsis_risk"


class ProteinuriaLevel(str, Enum):
    NEGATIVE = "negative"
    TRACE = "trace"
    ONE_PLUS = "1+"
    TWO_PLUS = "2+"
    THREE_PLUS = "3+"


class ReferralStatus(str, Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    TIMEOUT_ESCALATED = "timeout_escalated"
    RESOLVED = "resolved"


class ActionTakenType(str, Enum):
    MEDICATION_GIVEN = "medication_given"
    AMBULANCE_DISPATCHED = "ambulance_dispatched"
    HOSPITAL_ADMITTED = "hospital_admitted"


class UserRole(str, Enum):
    NURSE = "nurse"
    DISTRICT_SPECIALIST = "district_specialist"
    REGIONAL_SPECIALIST = "regional_specialist"
    AUDITOR = "auditor"


class FacilityType(str, Enum):
    DISTRICT_CLINIC = "district_clinic"
    DISTRICT_HOSPITAL = "district_hospital"
    REGIONAL_OVABMU = "regional_ovabmu"
    REGIONAL_CENTER = "regional_center"


class BloodPressure(BaseModel):
    systolic: int = Field(ge=50, le=280)
    diastolic: int = Field(ge=30, le=180)

    @model_validator(mode="after")
    def validate_pressure_delta(self) -> "BloodPressure":
        if self.systolic <= self.diastolic:
            raise ValueError("Sistolik bosim diastolik bosimdan yuqori bo'lishi shart")
        return self

    @property
    def map_value(self) -> float:
        """Mean Arterial Pressure: (SBP + 2 * DBP) / 3"""
        return round((self.systolic + 2 * self.diastolic) / 3, 2)
