from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from app.domain.entities import VitalsReading


class IVitalsRepository(ABC):
    @abstractmethod
    async def add(self, reading: VitalsReading) -> None:
        pass

    @abstractmethod
    async def get_by_patient_id(self, patient_id: UUID) -> List[VitalsReading]:
        pass
