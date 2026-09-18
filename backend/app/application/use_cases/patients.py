from uuid import UUID

from app.application.ports.uow.unit_of_work import IUnitOfWork
from app.domain.entities import Patient
from app.domain.exceptions import DomainException


class RegisterPatientUseCase:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def execute(self, patient_data: dict) -> Patient:
        async with self.uow:
            patient = Patient(**patient_data)
            await self.uow.patients.add(patient)
            await self.uow.commit()
            return patient


class GetPatientProfileUseCase:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def execute(self, patient_id: UUID) -> Patient:
        async with self.uow:
            patient = await self.uow.patients.get_by_id(patient_id)
            if not patient:
                raise DomainException("Bemor topilmadi")
            return patient
