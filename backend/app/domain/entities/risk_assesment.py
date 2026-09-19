from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.domain.value_objects.perinatal import ObstetricSyndrome, RiskZone


class RiskAssessment(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    patient_id: UUID
    vitals_reading_id: UUID
    risk_zone: RiskZone
    syndrome: ObstetricSyndrome
    shock_index: float
    velocity_score: float = 0.0
    top_factors: dict[str, Any] = Field(default_factory=dict)
    computed_at: datetime = Field(default_factory=datetime.now)
