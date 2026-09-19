from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.domain.exceptions.domain_exceptions import InvalidGestationWeekError


class Patient(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    full_name: str
    pinfl: str | None = None
    age: int = Field(ge=12, le=60)
    gestational_week: int = Field(ge=1, le=45)
    home_facility_id: UUID
    district: str
    history_hypertension: bool = False
    history_preeclampsia: bool = False
    created_at: datetime = Field(default_factory=datetime.now)

    def validate_gestation(self) -> None:
        if self.gestational_week < 1 or self.gestational_week > 45:
            raise InvalidGestationWeekError(
                "Homiladorlik muddati 1 va 45 hafta oralig'ida bo'lishi shart"
            )
