from typing import Sequence
from uuid import UUID

from app.application.ports.unit_of_work import UnitOfWorkPort
from app.domain.entities.vitals import VitalsReading
from app.domain.exceptions.domain_exceptions import DomainError


class VitalsNotFoundError(DomainError):
    def __init__(self, vitals_id: UUID):
        super().__init__(f"Ko'rik ko'rsatkichlari topilmadi: {vitals_id}")


class GetPatientVitalsHistoryUseCase:
    """Frontendda qon bosimi va puls dinamikasini grafik qilib ko'rsatish uchun"""

    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, patient_id: UUID) -> Sequence[VitalsReading]:
        async with self.uow:
            patient = await self.uow.patients.get_by_id(patient_id)
            if not patient:
                raise DomainError(f"Bemor topilmadi: {patient_id}")
            return await self.uow.vitals.list_all_by_patient(patient_id)


class GetVitalsDetailUseCase:
    """Bitta aniq o'lchov tafsilotlarini ko'rish"""

    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, vitals_id: UUID) -> VitalsReading:
        async with self.uow:
            vitals = await self.uow.vitals.get_by_id(vitals_id)
            if not vitals:
                raise VitalsNotFoundError(vitals_id)
            return vitals
