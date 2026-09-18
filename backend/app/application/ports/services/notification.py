from abc import ABC, abstractmethod

from app.domain.entities import RiskAssessment


class INotificationService(ABC):
    @abstractmethod
    async def send_alert(self, assessment: RiskAssessment) -> None:
        pass
