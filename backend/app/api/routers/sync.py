from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, get_uow, ml_instance, worker_instance
from app.api.schemas import SyncBatchRequest
from app.application.use_cases.sync import SyncOfflineVitalsUseCase
from app.application.use_cases.triage import ProcessTriageUseCase
from app.domain.entities.staff import StaffMember

router = APIRouter(prefix="/sync", tags=["Offline Sinxronizatsiya"])


@router.post("/batch")
async def sync_offline_records(
    req: SyncBatchRequest,
    uow=Depends(get_uow),
    current_user: StaffMember = Depends(get_current_user),
):
    triage_use_case = ProcessTriageUseCase(
        uow=uow, worker=worker_instance, ml_predictor=ml_instance
    )
    sync_use_case = SyncOfflineVitalsUseCase(triage_use_case=triage_use_case)
    return await sync_use_case.execute(batch_records=req.records, staff_id=current_user.id)
