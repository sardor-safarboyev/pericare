from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities import RiskAssessment


class IRiskAssessmentRepository(ABC):
    @abstractmethod
    async def add(self, assessment: RiskAssessment) -> None:
        pass

    @abstractmethod
    async def acknowledge(self, assessment_id: UUID, specialist_id: UUID) -> None:
        """Audit trail: xavfni mutaxassis ko'rganini tasdiqlash"""
        pass
