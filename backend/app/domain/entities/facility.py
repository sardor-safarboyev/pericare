# app/domain/entities/facility.py
from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.domain.value_objects.perinatal import FacilityType


class Facility(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    facility_type: FacilityType
    district: str | None = None
    region: str
    telegram_chat_id: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
