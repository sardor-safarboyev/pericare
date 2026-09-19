import json
import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import (
    get_current_user,
    get_uow,
    ml_instance,
    ocr_instance,
    worker_instance,
)
from app.api.schemas import TriageResponse, TriageSubmitRequest
from app.application.ports.ocr import ExtractedVitals
from app.application.use_cases.ocr_triage import ExtractVitalsFromImageUseCase
from app.application.use_cases.triage import ProcessTriageUseCase
from app.domain.entities.staff import StaffMember

router = APIRouter(prefix="/triage", tags=["Triage va Skrining"])

METRICS_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__), "../../infrastructure/ml/models/evaluation_metrics.json"
    )
)


@router.post("/evaluate", response_model=TriageResponse, status_code=status.HTTP_200_OK)
async def evaluate_vitals(
    req: TriageSubmitRequest,
    uow=Depends(get_uow),
    current_user: StaffMember = Depends(get_current_user),
):
    """MEOWS, Trajectory dinamikasi va Stacking ML ansambli asosida bemorni baholash."""
    use_case = ProcessTriageUseCase(
        uow=uow,
        worker=worker_instance,
        ml_predictor=ml_instance,
    )
    try:
        vitals, assessment, referral = await use_case.execute(
            patient_id=req.patient_id,
            recorded_by_id=current_user.id,
            systolic_bp=req.systolic_bp,
            diastolic_bp=req.diastolic_bp,
            heart_rate=req.heart_rate,
            body_temp=req.body_temp,
            proteinuria=req.proteinuria,
            respiratory_rate=req.respiratory_rate,
            blood_sugar=req.blood_sugar,
            raw_image_url=req.raw_image_url,
        )
        return TriageResponse(
            vitals_id=vitals.id,
            assessment_id=assessment.id,
            risk_zone=assessment.risk_zone,
            syndrome=assessment.syndrome,
            shock_index=assessment.shock_index,
            velocity_score=assessment.velocity_score,
            top_factors=assessment.top_factors,
            referral_id=referral.id if referral else None,
            sla_expires_at=referral.sla_expires_at if referral else None,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/ocr-extract", response_model=ExtractedVitals, status_code=status.HTTP_200_OK)
async def ocr_extract(
    file: UploadFile = File(...),
    current_user: StaffMember = Depends(get_current_user),
):
    """Tonometr yoki tahlil varaqasi tasviridan ko'rsatkichlarni raqamlashtirish."""
    # Fayl turi tekshiruvi
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Faqat JPEG, PNG yoki WEBP formatidagi rasmlar qabul qilinadi.",
        )

    use_case = ExtractVitalsFromImageUseCase(ocr_port=ocr_instance)
    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Rasm hajmi 10MB dan oshmasligi kerak.",
            )
        extracted = await use_case.execute(contents)
        return extracted
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@router.get("/metrics", status_code=status.HTTP_200_OK)
async def get_ml_metrics(
    current_user: StaffMember = Depends(get_current_user),
):
    """Hakamlar va audit uchun Stacking ML modelining ROC-AUC, F1 va Brier ballari."""
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
    return {
        "status": "not_trained",
        "message": "Model hali o'qitilmagan. 'python -m app.infrastructure.ml.train' buyrug'ini bering.",
    }
