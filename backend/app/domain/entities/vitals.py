from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.domain.value_objects.perinatal import BloodPressure, ProteinuriaLevel


class VitalsReading(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    patient_id: UUID
    recorded_by_id: UUID | None = None
    blood_pressure: BloodPressure
    heart_rate: int = Field(ge=30, le=220)
    body_temp: float = Field(ge=34.0, le=43.0, default=36.6)
    blood_sugar: float | None = Field(default=None, ge=1.0, le=35.0)
    proteinuria: ProteinuriaLevel
    respiratory_rate: int = Field(default=18, ge=8, le=60)
    raw_image_url: str | None = None
    is_synced_offline: bool = False
    recorded_at: datetime = Field(default_factory=datetime.now)

    @property
    def shock_index(self) -> float:
        """Shock Index: Heart Rate / Systolic BP"""
        return round(self.heart_rate / self.blood_pressure.systolic, 2)
