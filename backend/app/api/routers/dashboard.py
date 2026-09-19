# app/api/routers/dashboard.py
from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, get_uow
from app.application.use_cases.dashboard import GetDashboardStatsUseCase
from app.domain.entities.staff import StaffMember

router = APIRouter(prefix="/dashboard", tags=["Dashboard va Monitoring"])


@router.get("/stats")
async def get_stats(
    uow=Depends(get_uow),
    current_user: StaffMember = Depends(get_current_user),
):
    use_case = GetDashboardStatsUseCase(uow=uow)
    return await use_case.execute(staff_id=current_user.id)
