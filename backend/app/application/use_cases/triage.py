from uuid import UUID

from app.application.ports.services.prediction import IPredictionService
from app.application.ports.services.worker import ITaskQueue
from app.application.ports.uow.unit_of_work import IUnitOfWork
from app.domain.entities import RiskAssessment, VitalsReading
from app.domain.exceptions import DomainException
from app.domain.value_objects import RiskZone


class SubmitVitalsUseCase:
    def __init__(
        self,
        uow: IUnitOfWork,
        prediction_service: IPredictionService,
        task_queue: ITaskQueue,
    ):
        self.uow = uow
        self.prediction_service = prediction_service
        self.task_queue = task_queue

    async def execute(self, vitals_data: dict) -> RiskAssessment:
        async with self.uow:
            patient = await self.uow.patients.get_by_id(vitals_data["patient_id"])
            if not patient:
                raise DomainException("Bemor topilmadi")

            vitals = VitalsReading(**vitals_data)
            await self.uow.vitals.add(vitals)

            assessment = await self.prediction_service.predict_risk(vitals, patient)
            await self.uow.assessments.add(assessment)

            await self.uow.commit()

            if assessment.risk_level.zone in [RiskZone.RED, RiskZone.YELLOW]:
                self.task_queue.enqueue_task(
                    "send_alert_notification",
                    assessment_id=str(assessment.id),
                    zone=assessment.risk_level.zone.value,
                    district=patient.district,
                )

            return assessment


class AcknowledgeAlertUseCase:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def execute(self, assessment_id: UUID, specialist_id: UUID) -> None:
        async with self.uow:
            # Audit trail method in repository
            await self.uow.assessments.acknowledge(assessment_id, specialist_id)
            await self.uow.commit()
