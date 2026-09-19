from abc import ABC, abstractmethod
from uuid import UUID


class WorkerPort(ABC):
    @abstractmethod
    async def enqueue_triage_alert(
        self,
        referral_id: UUID,
        target_chat_id: str,
        risk_zone: str,
        syndrome: str,
        sla_minutes: int,
    ) -> None:
        """Telegram orqali zudlik bilan Qizil/Sariq ogohlantirishni navbatga qo'yadi."""
        pass

    @abstractmethod
    async def enqueue_escalation_alert(
        self,
        referral_id: UUID,
        target_facility_chat_id: str,
        urgency_level: str,
    ) -> None:
        """Viloyat OvaBMU markaziga kechikkan yoki uzatilgan holat bo'yicha xabar yuboradi."""
        pass
