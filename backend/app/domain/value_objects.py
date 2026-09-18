from enum import Enum

from pydantic import BaseModel, Field, model_validator


class Role(str, Enum):
    NURSE = "nurse"
    SPECIALIST = "specialist"
    ADMIN = "admin"


class RiskZone(str, Enum):
    GREEN = "yashil"
    YELLOW = "sariq"
    RED = "qizil"


class BloodPressure(BaseModel):
    systolic: int = Field(..., gt=0, le=300, description="Sistolik bosim (tepasi)")
    diastolic: int = Field(..., gt=0, le=200, description="Diastolik bosim (pasti)")

    @model_validator(mode="after")
    def validate_pressure_logic(self) -> "BloodPressure":
        if self.diastolic >= self.systolic:
            raise ValueError("Sistolik bosim diastolik bosimdan yuqori bo'lishi shart.")
        return self


class RiskLevel(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="0 va 1 oralig'idagi ehtimollik")
    zone: RiskZone
