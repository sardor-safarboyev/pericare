from datetime import datetime, timezone
from uuid import UUID

from app.application.ports.ml import RiskPredictorPort
from app.application.ports.unit_of_work import UnitOfWorkPort
from app.application.ports.worker import WorkerPort
from app.domain.entities.referral import Referral
from app.domain.entities.risk_assessment import RiskAssessment
from app.domain.entities.vitals import VitalsReading
from app.domain.exceptions.domain_exceptions import DomainError
from app.domain.services.triage_engine import PerinatalTriageEngine
from app.domain.value_objects.perinatal import (
    BloodPressure,
    ProteinuriaLevel,
    ReferralStatus,
    RiskZone,
)


class PatientNotFoundError(DomainError):
    def __init__(self, patient_id: UUID):
        super().__init__(f"Bemor topilmadi: {patient_id}")


class ProcessTriageUseCase:
    def __init__(
        self,
        uow: UnitOfWorkPort,
        worker: WorkerPort,
        ml_predictor: RiskPredictorPort | None = None,
    ):
        self.uow = uow
        self.worker = worker
        self.ml_predictor = ml_predictor

    async def execute(
        self,
        patient_id: UUID,
        recorded_by_id: UUID,
        systolic_bp: int,
        diastolic_bp: int,
        heart_rate: int,
        body_temp: float,
        proteinuria: ProteinuriaLevel,
        respiratory_rate: int = 18,
        blood_sugar: float | None = None,
        raw_image_url: str | None = None,
        is_synced_offline: bool = False,
    ) -> tuple[VitalsReading, RiskAssessment, Referral | None]:
        async with self.uow:
            patient = await self.uow.patients.get_by_id(patient_id)
            if not patient:
                raise PatientNotFoundError(patient_id)

            # 1. Bemorning avvalgi o'lchovlari tarixini olish (Trajectory uchun)
            history = await self.uow.vitals.get_history_by_patient(patient_id, limit=5)

            # 2. Yangi VitalsReading yaratish
            vitals = VitalsReading(
                patient_id=patient_id,
                recorded_by_id=recorded_by_id,
                blood_pressure=BloodPressure(systolic=systolic_bp, diastolic=diastolic_bp),
                heart_rate=heart_rate,
                body_temp=body_temp,
                proteinuria=proteinuria,
                respiratory_rate=respiratory_rate,
                blood_sugar=blood_sugar,
                raw_image_url=raw_image_url,
                is_synced_offline=is_synced_offline,
                recorded_at=datetime.now(timezone.utc),
            )
            await self.uow.vitals.add(vitals)
            await self.uow.flush()

            # 3. Deterministik MEOWS va Trajectory tahlili
            eval_result = PerinatalTriageEngine.evaluate(current=vitals, history=history)

            final_zone = eval_result.risk_zone
            final_factors = dict(eval_result.top_factors)

            # 4. Gibrid ML qatlami (Agar model ulangan bo'lsa va deterministik qavat sariq/yashil bersa)
            if self.ml_predictor and final_zone != RiskZone.QIZIL:
                ml_res = self.ml_predictor.predict_risk(current_vitals=vitals, history=history)
                # Agar ML yuqoriroq xavfni bashorat qilsa, uni qabul qilamiz
                if ml_res.predicted_zone == RiskZone.QIZIL.value:
                    final_zone = RiskZone.QIZIL
                    final_factors.update(ml_res.top_shap_factors)
                elif (
                    ml_res.predicted_zone == RiskZone.SARIQ.value and final_zone == RiskZone.YASHIL
                ):
                    final_zone = RiskZone.SARIQ
                    final_factors.update(ml_res.top_shap_factors)

            # 5. Risk Assessment yozuvini saqlash
            assessment = RiskAssessment(
                patient_id=patient_id,
                vitals_reading_id=vitals.id,
                risk_zone=final_zone,
                syndrome=eval_result.syndrome,
                shock_index=eval_result.shock_index,
                velocity_score=eval_result.velocity_score,
                top_factors=final_factors,
            )
            await self.uow.assessments.add(assessment)

            referral: Referral | None = None

            # 6. Eskalatsiya (Sariq yoki Qizil bo'lsa)
            if final_zone in (RiskZone.QIZIL, RiskZone.SARIQ):
                home_facility = await self.uow.facilities.get_by_id(patient.home_facility_id)
                if home_facility is None:
                    raise DomainError(f"Klinika topilmadi: {patient.home_facility_id}")

                target_facility_id: UUID = home_facility.id
                target_chat_id: str | None = home_facility.telegram_chat_id

                # Qizil xavf darhol viloyat markaziga ochiladi
                if final_zone == RiskZone.QIZIL:
                    regional = await self.uow.facilities.get_regional_center(home_facility.region)
                    if regional is not None:
                        target_facility_id = regional.id
                        target_chat_id = regional.telegram_chat_id

                referral = Referral(
                    patient_id=patient.id,
                    risk_assessment_id=assessment.id,
                    from_facility_id=patient.home_facility_id,
                    to_facility_id=target_facility_id,
                    status=ReferralStatus.OPEN,
                )
                await self.uow.referrals.add(referral)

                # Celery orqali Telegram ogohlantirishini yuborish
                if target_chat_id:
                    await self.worker.enqueue_triage_alert(
                        referral_id=referral.id,
                        target_chat_id=target_chat_id,
                        risk_zone=final_zone.value,
                        syndrome=eval_result.syndrome.value,
                        sla_minutes=60 if final_zone == RiskZone.QIZIL else 120,
                    )

            await self.uow.commit()
            return vitals, assessment, referral
