from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_prediction_service, get_task_queue, get_uow
from app.application.ports.services.prediction import IPredictionService
from app.application.ports.services.worker import ITaskQueue
from app.application.ports.uow.unit_of_work import IUnitOfWork
from app.application.use_cases.triage import SubmitVitalsUseCase
from app.domain.exceptions import DomainException

router = APIRouter(prefix="/triage", tags=["Triage & Monitoring"])


class SubmitVitalsRequest(BaseModel):
    patient_id: UUID
    recorded_by_id: UUID
    blood_pressure: dict  # {"systolic": 120, "diastolic": 80}
    proteinuria_level: str
    blood_sugar: float | None = None
    body_temp: float | None = None
    heart_rate: int | None = None


@router.post("/vitals")
async def submit_vitals(
    request: SubmitVitalsRequest,
    uow: IUnitOfWork = Depends(get_uow),
    prediction: IPredictionService = Depends(get_prediction_service),
    task_queue: ITaskQueue = Depends(get_task_queue),
):
    use_case = SubmitVitalsUseCase(uow=uow, prediction_service=prediction, task_queue=task_queue)
    try:
        assessment = await use_case.execute(request.model_dump())
        return assessment
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
