from datetime import datetime
from typing import Sequence
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.ports.repositories import (
    FacilityRepository,
    PatientRepository,
    ReferralRepository,
    RiskAssessmentRepository,
    StaffRepository,
    VitalsRepository,
)
from app.domain.entities.facility import Facility
from app.domain.entities.patient import Patient
from app.domain.entities.referral import Referral
from app.domain.entities.risk_assessment import RiskAssessment
from app.domain.entities.staff import StaffMember
from app.domain.entities.vitals import VitalsReading
from app.domain.value_objects.perinatal import (
    ActionTakenType,
    BloodPressure,
    FacilityType,
    ObstetricSyndrome,
    ProteinuriaLevel,
    ReferralStatus,
    RiskZone,
    UserRole,
)
from app.infrastructure.database.models import (
    FacilityModel,
    PatientModel,
    ReferralModel,
    RiskAssessmentModel,
    StaffModel,
    VitalsReadingModel,
)


class SqlPatientRepository(PatientRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, m: PatientModel) -> Patient:
        return Patient(
            id=m.id,
            full_name=m.full_name,
            pinfl=m.pinfl,
            age=m.age,
            gestational_week=m.gestational_week,
            home_facility_id=m.home_facility_id,
            district=m.district,
            history_hypertension=m.history_hypertension,
            history_preeclampsia=m.history_preeclampsia,
            created_at=m.created_at,
        )

    async def get_by_id(self, patient_id: UUID) -> Patient | None:
        res = await self.session.get(PatientModel, patient_id)
        return self._to_entity(res) if res else None

    async def get_by_pinfl(self, pinfl: str) -> Patient | None:
        stmt = select(PatientModel).where(PatientModel.pinfl == pinfl)
        res = await self.session.scalar(stmt)
        return self._to_entity(res) if res else None

    async def add(self, patient: Patient) -> None:
        model = PatientModel(
            id=patient.id,
            full_name=patient.full_name,
            pinfl=patient.pinfl,
            age=patient.age,
            gestational_week=patient.gestational_week,
            home_facility_id=patient.home_facility_id,
            district=patient.district,
            history_hypertension=patient.history_hypertension,
            history_preeclampsia=patient.history_preeclampsia,
            created_at=patient.created_at,
        )
        self.session.add(model)

    async def list_by_district(self, district: str) -> Sequence[Patient]:
        stmt = select(PatientModel).where(PatientModel.district == district)
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def list_by_facility(self, facility_id: UUID) -> Sequence[Patient]:
        stmt = select(PatientModel).where(PatientModel.home_facility_id == facility_id)
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]


class SqlVitalsRepository(VitalsRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, m: VitalsReadingModel) -> VitalsReading:
        return VitalsReading(
            id=m.id,
            patient_id=m.patient_id,
            recorded_by_id=m.recorded_by_id,
            blood_pressure=BloodPressure(systolic=m.systolic_bp, diastolic=m.diastolic_bp),
            heart_rate=m.heart_rate,
            body_temp=m.body_temp,
            blood_sugar=m.blood_sugar,
            proteinuria=ProteinuriaLevel(m.proteinuria),
            respiratory_rate=m.respiratory_rate,
            raw_image_url=m.raw_image_url,
            is_synced_offline=m.is_synced_offline,
            recorded_at=m.recorded_at,
        )

    async def get_by_id(self, vitals_id: UUID) -> VitalsReading | None:
        res = await self.session.get(VitalsReadingModel, vitals_id)
        return self._to_entity(res) if res else None

    async def add(self, vitals: VitalsReading) -> None:
        model = VitalsReadingModel(
            id=vitals.id,
            patient_id=vitals.patient_id,
            recorded_by_id=vitals.recorded_by_id,
            systolic_bp=vitals.blood_pressure.systolic,
            diastolic_bp=vitals.blood_pressure.diastolic,
            heart_rate=vitals.heart_rate,
            body_temp=vitals.body_temp,
            blood_sugar=vitals.blood_sugar,
            proteinuria=vitals.proteinuria.value,
            respiratory_rate=vitals.respiratory_rate,
            raw_image_url=vitals.raw_image_url,
            is_synced_offline=vitals.is_synced_offline,
            recorded_at=vitals.recorded_at,
        )
        self.session.add(model)

    async def get_history_by_patient(self, patient_id: UUID, limit: int = 5) -> list[VitalsReading]:
        stmt = (
            select(VitalsReadingModel)
            .where(VitalsReadingModel.patient_id == patient_id)
            .order_by(VitalsReadingModel.recorded_at.desc())
            .limit(limit)
        )
        res = await self.session.scalars(stmt)
        # Qaytarishda eng eskisidan eng yangisiga qarab tartiblaymiz
        items = [self._to_entity(m) for m in res]
        items.reverse()
        return items

    async def list_all_by_patient(self, patient_id: UUID) -> Sequence[VitalsReading]:
        stmt = (
            select(VitalsReadingModel)
            .where(VitalsReadingModel.patient_id == patient_id)
            .order_by(VitalsReadingModel.recorded_at.asc())
        )
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]


class SqlRiskAssessmentRepository(RiskAssessmentRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, m: RiskAssessmentModel) -> RiskAssessment:
        return RiskAssessment(
            id=m.id,
            patient_id=m.patient_id,
            vitals_reading_id=m.vitals_reading_id,
            risk_zone=RiskZone(m.risk_zone),
            syndrome=ObstetricSyndrome(m.syndrome),
            shock_index=float(m.shock_index),
            velocity_score=float(m.velocity_score),
            top_factors=m.top_factors,
            computed_at=m.computed_at,
        )

    async def get_by_id(self, assessment_id: UUID) -> RiskAssessment | None:
        res = await self.session.get(RiskAssessmentModel, assessment_id)
        return self._to_entity(res) if res else None

    async def add(self, assessment: RiskAssessment) -> None:
        model = RiskAssessmentModel(
            id=assessment.id,
            patient_id=assessment.patient_id,
            vitals_reading_id=assessment.vitals_reading_id,
            risk_zone=assessment.risk_zone.value,
            syndrome=assessment.syndrome.value,
            shock_index=assessment.shock_index,
            velocity_score=assessment.velocity_score,
            top_factors=assessment.top_factors,
            computed_at=assessment.computed_at,
        )
        self.session.add(model)

    async def list_by_patient(self, patient_id: UUID) -> Sequence[RiskAssessment]:
        stmt = (
            select(RiskAssessmentModel)
            .where(RiskAssessmentModel.patient_id == patient_id)
            .order_by(RiskAssessmentModel.computed_at.desc())
        )
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def get_latest_by_patient(self, patient_id: UUID) -> RiskAssessment | None:
        stmt = (
            select(RiskAssessmentModel)
            .where(RiskAssessmentModel.patient_id == patient_id)
            .order_by(RiskAssessmentModel.computed_at.desc())
            .limit(1)
        )
        res = await self.session.scalar(stmt)
        return self._to_entity(res) if res else None


class SqlReferralRepository(ReferralRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, m: ReferralModel) -> Referral:
        return Referral(
            id=m.id,
            patient_id=m.patient_id,
            risk_assessment_id=m.risk_assessment_id,
            from_facility_id=m.from_facility_id,
            to_facility_id=m.to_facility_id,
            assigned_specialist_id=m.assigned_specialist_id,
            status=ReferralStatus(m.status),
            sla_expires_at=m.sla_expires_at,
            action_type=ActionTakenType(m.action_type) if m.action_type else None,
            action_notes=m.action_notes,
            created_at=m.created_at,
            resolved_at=m.resolved_at,
        )

    async def get_by_id(self, referral_id: UUID) -> Referral | None:
        res = await self.session.get(ReferralModel, referral_id)
        return self._to_entity(res) if res else None

    async def add(self, referral: Referral) -> None:
        model = ReferralModel(
            id=referral.id,
            patient_id=referral.patient_id,
            risk_assessment_id=referral.risk_assessment_id,
            from_facility_id=referral.from_facility_id,
            to_facility_id=referral.to_facility_id,
            assigned_specialist_id=referral.assigned_specialist_id,
            status=referral.status.value,
            sla_expires_at=referral.sla_expires_at,
            action_type=referral.action_type.value if referral.action_type else None,
            action_notes=referral.action_notes,
            created_at=referral.created_at,
            resolved_at=referral.resolved_at,
        )
        self.session.add(model)

    async def update(self, referral: Referral) -> None:
        stmt = (
            update(ReferralModel)
            .where(ReferralModel.id == referral.id)
            .values(
                assigned_specialist_id=referral.assigned_specialist_id,
                status=referral.status.value,
                action_type=referral.action_type.value if referral.action_type else None,
                action_notes=referral.action_notes,
                resolved_at=referral.resolved_at,
            )
        )
        await self.session.execute(stmt)

    async def list_open_past_sla(self, threshold_time: datetime) -> Sequence[Referral]:
        stmt = select(ReferralModel).where(
            ReferralModel.status == ReferralStatus.OPEN.value,
            ReferralModel.sla_expires_at <= threshold_time,
        )
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def list_active_by_facility(self, facility_id: UUID) -> Sequence[Referral]:
        stmt = select(ReferralModel).where(
            ReferralModel.to_facility_id == facility_id,
            ReferralModel.status.in_(
                [ReferralStatus.OPEN.value, ReferralStatus.ACKNOWLEDGED.value]
            ),
        )
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def list_active_by_region(self, region: str) -> Sequence[Referral]:
        stmt = (
            select(ReferralModel)
            .join(FacilityModel, ReferralModel.to_facility_id == FacilityModel.id)
            .where(
                FacilityModel.region == region,
                ReferralModel.status.in_(
                    [ReferralStatus.OPEN.value, ReferralStatus.TIMEOUT_ESCALATED.value]
                ),
            )
        )
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def get_counts_by_status(self, facility_id: UUID | None = None) -> dict[str, int]:
        stmt = select(ReferralModel.status, func.count(ReferralModel.id)).group_by(
            ReferralModel.status
        )
        if facility_id:
            stmt = stmt.where(ReferralModel.to_facility_id == facility_id)
        res = await self.session.execute(stmt)
        counts = {row[0]: row[1] for row in res.all()}
        return {
            "open": counts.get(ReferralStatus.OPEN.value, 0),
            "acknowledged": counts.get(ReferralStatus.ACKNOWLEDGED.value, 0),
            "timeout_escalated": counts.get(ReferralStatus.TIMEOUT_ESCALATED.value, 0),
            "resolved": counts.get(ReferralStatus.RESOLVED.value, 0),
        }


class SqlFacilityRepository(FacilityRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, m: FacilityModel) -> Facility:
        return Facility(
            id=m.id,
            name=m.name,
            facility_type=FacilityType(m.facility_type)
            if m.facility_type in FacilityType._value2member_map_
            else FacilityType.REGIONAL_OVABMU,
            district=m.district,
            region=m.region,
            telegram_chat_id=m.telegram_chat_id,
            created_at=m.created_at,
        )

    async def get_by_id(self, facility_id: UUID) -> Facility | None:
        res = await self.session.get(FacilityModel, facility_id)
        return self._to_entity(res) if res else None

    async def get_regional_center(self, region: str) -> Facility | None:
        stmt = select(FacilityModel).where(
            FacilityModel.region == region,
            FacilityModel.facility_type == FacilityType.REGIONAL_OVABMU.value,
        )
        res = await self.session.scalar(stmt)
        return self._to_entity(res) if res else None

    async def list_all(self) -> Sequence[Facility]:
        stmt = select(FacilityModel)
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def list_by_region(self, region: str) -> Sequence[Facility]:
        stmt = select(FacilityModel).where(FacilityModel.region == region)
        res = await self.session.scalars(stmt)
        return [self._to_entity(m) for m in res]

    async def add(self, facility: Facility) -> None:
        model = FacilityModel(
            id=facility.id,
            name=facility.name,
            facility_type=facility.facility_type.value,
            district=facility.district,
            region=facility.region,
            telegram_chat_id=facility.telegram_chat_id,
            created_at=facility.created_at,
        )
        self.session.add(model)


class SqlStaffRepository(StaffRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, m: StaffModel) -> StaffMember:
        return StaffMember(
            id=m.id,
            full_name=m.full_name,
            email=m.email,
            role=UserRole(m.role),
            facility_id=m.facility_id,
            telegram_user_id=m.telegram_user_id,
            is_active=m.is_active,
            created_at=m.created_at,
        )

    async def get_by_id(self, staff_id: UUID) -> StaffMember | None:
        res = await self.session.get(StaffModel, staff_id)
        return self._to_entity(res) if res else None

    async def get_by_email(self, email: str) -> StaffMember | None:
        stmt = select(StaffModel).where(StaffModel.email == email)
        res = await self.session.scalar(stmt)
        return self._to_entity(res) if res else None

    async def get_with_credentials(self, email: str) -> tuple[StaffMember, str] | None:
        stmt = select(StaffModel).where(StaffModel.email == email)
        res = await self.session.scalar(stmt)
        if not res:
            return None
        return self._to_entity(res), res.hashed_password

    async def add(self, staff: StaffMember, hashed_password: str) -> None:
        model = StaffModel(
            id=staff.id,
            full_name=staff.full_name,
            email=staff.email,
            hashed_password=hashed_password,
            role=staff.role.value,
            facility_id=staff.facility_id,
            telegram_user_id=staff.telegram_user_id,
            is_active=staff.is_active,
            created_at=staff.created_at,
        )
        self.session.add(model)
