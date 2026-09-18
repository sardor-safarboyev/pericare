from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities import Patient


class IPatientRepository(ABC):
    @abstractmethod
    async def add(self, patient: Patient) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        pass

    @abstractmethod
    async def list_by_district(self, district: str) -> List[Patient]:
        pass
