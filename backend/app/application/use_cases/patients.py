from typing import Sequence
from uuid import UUID

from app.application.ports.unit_of_work import UnitOfWorkPort
from app.domain.entities.patient import Patient
from app.domain.entities.risk_assessment import RiskAssessment
from app.domain.exceptions.domain_exceptions import DomainError


class PatientNotFoundError(DomainError):
    def __init__(self, patient_id: UUID):
        super().__init__(f"Bemor topilmadi: {patient_id}")


class RegisterPatientUseCase:
    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(
        self,
        full_name: str,
        age: int,
        gestational_week: int,
        home_facility_id: UUID,
        pinfl: str | None = None,
        district: str | None = None,
        history_hypertension: bool = False,
        history_preeclampsia: bool = False,
    ) -> Patient:
        async with self.uow:
            facility = await self.uow.facilities.get_by_id(home_facility_id)
            if not facility:
                raise DomainError("Biriktirilgan klinika topilmadi")

            resolved_district = district or facility.district or facility.region

            patient = Patient(
                full_name=full_name,
                pinfl=pinfl,
                age=age,
                gestational_week=gestational_week,
                home_facility_id=home_facility_id,
                district=resolved_district,
                history_hypertension=history_hypertension,
                history_preeclampsia=history_preeclampsia,
            )
            patient.validate_gestation()

            await self.uow.patients.add(patient)
            await self.uow.commit()
            return patient


class GetPatientHistoryUseCase:
    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, patient_id: UUID) -> Sequence[RiskAssessment]:
        async with self.uow:
            patient = await self.uow.patients.get_by_id(patient_id)
            if not patient:
                raise PatientNotFoundError(patient_id)
            return await self.uow.assessments.list_by_patient(patient_id)
