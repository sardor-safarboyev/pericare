# app/domain/entities/staff.py
from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.domain.value_objects.perinatal import UserRole


class StaffMember(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    full_name: str
    email: str
    role: UserRole
    facility_id: UUID
    telegram_user_id: str | None = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
