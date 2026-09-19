# app/api/routers/patients.py
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_uow
from app.api.schemas import PatientRegisterRequest, PatientResponse
from app.application.use_cases.patients import RegisterPatientUseCase
from app.application.use_cases.vitals import GetPatientVitalsHistoryUseCase
from app.domain.entities.staff import StaffMember

router = APIRouter(prefix="/patients", tags=["Bemorlar"])


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    req: PatientRegisterRequest,
    uow=Depends(get_uow),
    current_user: StaffMember = Depends(get_current_user),
):
    use_case = RegisterPatientUseCase(uow=uow)
    try:
        return await use_case.execute(
            full_name=req.full_name,
            age=req.age,
            gestational_week=req.gestational_week,
            home_facility_id=req.home_facility_id,
            pinfl=req.pinfl,
            district=req.district,
            history_hypertension=req.history_hypertension,
            history_preeclampsia=req.history_preeclampsia,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{patient_id}/vitals")
async def get_patient_vitals_history(
    patient_id: UUID,
    uow=Depends(get_uow),
    current_user: StaffMember = Depends(get_current_user),
):
    use_case = GetPatientVitalsHistoryUseCase(uow=uow)
    try:
        return await use_case.execute(patient_id=patient_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
