from datetime import datetime, timedelta
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.domain.exceptions.domain_exceptions import ReferralStateTransitionError
from app.domain.value_objects.perinatal import ActionTakenType, ReferralStatus


class Referral(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    patient_id: UUID
    risk_assessment_id: UUID
    from_facility_id: UUID
    to_facility_id: UUID
    assigned_specialist_id: UUID | None = None
    status: ReferralStatus = ReferralStatus.OPEN
    sla_expires_at: datetime = Field(default_factory=lambda: datetime.now() + timedelta(minutes=60))
    action_type: ActionTakenType | None = None
    action_notes: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    resolved_at: datetime | None = None

    def record_clinical_action(
        self,
        specialist_id: UUID,
        action_type: ActionTakenType,
        notes: str,
    ) -> None:
        if self.status == ReferralStatus.RESOLVED:
            raise ReferralStateTransitionError("Yakunlangan yo'llanmaga amal qo'shib bo'lmaydi")

        self.assigned_specialist_id = specialist_id
        self.action_type = action_type
        self.action_notes = notes
        self.status = ReferralStatus.RESOLVED
        self.resolved_at = datetime.now()

    def escalate_by_timeout(self, regional_facility_id: UUID) -> "Referral":
        if self.status == ReferralStatus.RESOLVED:
            raise ReferralStateTransitionError("Yakunlangan holatni eskalatsiya qilib bo'lmaydi")

        self.status = ReferralStatus.TIMEOUT_ESCALATED
        self.resolved_at = datetime.now()

        return Referral(
            patient_id=self.patient_id,
            risk_assessment_id=self.risk_assessment_id,
            from_facility_id=self.to_facility_id,
            to_facility_id=regional_facility_id,
            sla_expires_at=datetime.now() + timedelta(minutes=30),
            action_notes="Avtomatik SLA 60 daqiqalik kechikishi sababli viloyatga uzatildi",
        )
