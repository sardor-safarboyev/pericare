from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_current_user, get_uow
from app.api.schemas import ClinicalActionRequest, ReferralResponse
from app.application.use_cases.referrals import RecordClinicalActionUseCase
from app.domain.entities.staff import StaffMember

router = APIRouter(prefix="/referrals", tags=["Eskalatsiya va SLA Harakatlari"])


@router.post("/{referral_id}/action", response_model=ReferralResponse)
async def record_action(
    referral_id: UUID,
    req: ClinicalActionRequest,
    uow=Depends(get_uow),
    current_user: StaffMember = Depends(get_current_user),
):
    use_case = RecordClinicalActionUseCase(uow=uow)
    try:
        updated = await use_case.execute(
            referral_id=referral_id,
            specialist_id=current_user.id,
            action_type=req.action_type,
            notes=req.notes,
        )
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
