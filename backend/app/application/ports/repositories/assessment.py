from abc import ABC, abstractmethod

from app.domain.entities import RiskAssessment


class IRiskAssessmentRepository(ABC):
    @abstractmethod
    async def add(self, assessment: RiskAssessment) -> None:
        pass
