from datetime import datetime
from uuid import UUID

from app.application.ports.unit_of_work import UnitOfWorkPort
from app.application.ports.worker import WorkerPort
from app.domain.entities.referral import Referral
from app.domain.exceptions.domain_exceptions import DomainError
from app.domain.value_objects.perinatal import ActionTakenType, ReferralStatus


class ReferralNotFoundError(DomainError):
    def __init__(self, referral_id: UUID):
        super().__init__(f"Referral topilmadi: {referral_id}")


class RecordClinicalActionUseCase:
    """Mutaxassis protokol bo'yicha dori, reamobil yoki muolaja belgilashi"""

    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(
        self,
        referral_id: UUID,
        specialist_id: UUID,
        action_type: ActionTakenType,
        notes: str,
    ) -> Referral:
        async with self.uow:
            referral = await self.uow.referrals.get_by_id(referral_id)
            if not referral:
                raise ReferralNotFoundError(referral_id)

            referral.record_clinical_action(
                specialist_id=specialist_id,
                action_type=action_type,
                notes=notes,
            )

            await self.uow.referrals.update(referral)
            await self.uow.commit()
            return referral


class AuditSLATimeoutsUseCase:
    """Celery Beat fonida har 1 daqiqada aylanadigan audit tekshiruvi"""

    def __init__(self, uow: UnitOfWorkPort, worker: WorkerPort):
        self.uow = uow
        self.worker = worker

    async def execute(self) -> int:
        now = datetime.now()
        escalated_count = 0

        async with self.uow:
            expired_referrals = await self.uow.referrals.list_open_past_sla(threshold_time=now)

            for ref in expired_referrals:
                if ref.status == ReferralStatus.OPEN:
                    target_fac = await self.uow.facilities.get_by_id(ref.to_facility_id)
                    reg_center = await self.uow.facilities.get_regional_center(target_fac.region)

                    if reg_center and reg_center.id != ref.to_facility_id:
                        # 60 daqiqa o'tib ketgani sababli avtomatik viloyatga uzatish
                        new_escalated_ref = ref.escalate_by_timeout(
                            regional_facility_id=reg_center.id
                        )
                        await self.uow.referrals.update(ref)
                        await self.uow.referrals.add(new_escalated_ref)

                        if reg_center.telegram_chat_id:
                            await self.worker.enqueue_escalation_alert(
                                referral_id=new_escalated_ref.id,
                                target_facility_chat_id=reg_center.telegram_chat_id,
                                urgency_level="CRITICAL_TIMEOUT_SLA",
                            )
                        escalated_count += 1

            if escalated_count > 0:
                await self.uow.commit()

        return escalated_count
