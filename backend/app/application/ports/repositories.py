from abc import ABC, abstractmethod
from datetime import datetime
from typing import Sequence
from uuid import UUID

from app.domain.entities.facility import Facility
from app.domain.entities.patient import Patient
from app.domain.entities.referral import Referral
from app.domain.entities.risk_assessment import RiskAssessment
from app.domain.entities.staff import StaffMember
from app.domain.entities.vitals import VitalsReading


class PatientRepository(ABC):
    @abstractmethod
    async def get_by_id(self, patient_id: UUID) -> Patient | None:
        pass

    @abstractmethod
    async def get_by_pinfl(self, pinfl: str) -> Patient | None:
        pass

    @abstractmethod
    async def add(self, patient: Patient) -> None:
        pass

    @abstractmethod
    async def list_by_district(self, district: str) -> Sequence[Patient]:
        pass

    @abstractmethod
    async def list_by_facility(self, facility_id: UUID) -> Sequence[Patient]:
        """Muassasaga (QVP/OP) biriktirilgan barcha homiladorlar ro'yxati."""
        pass


class VitalsRepository(ABC):
    @abstractmethod
    async def get_by_id(self, vitals_id: UUID) -> VitalsReading | None:
        pass

    @abstractmethod
    async def add(self, vitals: VitalsReading) -> None:
        pass

    @abstractmethod
    async def get_history_by_patient(self, patient_id: UUID, limit: int = 5) -> list[VitalsReading]:
        pass

    @abstractmethod
    async def list_all_by_patient(self, patient_id: UUID) -> Sequence[VitalsReading]:
        """Bemorning butun homiladorlik davridagi barcha o'lchovlari jadvali."""
        pass


class RiskAssessmentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, assessment_id: UUID) -> RiskAssessment | None:
        pass

    @abstractmethod
    async def add(self, assessment: RiskAssessment) -> None:
        pass

    @abstractmethod
    async def list_by_patient(self, patient_id: UUID) -> Sequence[RiskAssessment]:
        pass

    @abstractmethod
    async def get_latest_by_patient(self, patient_id: UUID) -> RiskAssessment | None:
        pass


class ReferralRepository(ABC):
    @abstractmethod
    async def get_by_id(self, referral_id: UUID) -> Referral | None:
        pass

    @abstractmethod
    async def add(self, referral: Referral) -> None:
        pass

    @abstractmethod
    async def update(self, referral: Referral) -> None:
        pass

    @abstractmethod
    async def list_open_past_sla(self, threshold_time: datetime) -> Sequence[Referral]:
        pass

    @abstractmethod
    async def list_active_by_facility(self, facility_id: UUID) -> Sequence[Referral]:
        pass

    @abstractmethod
    async def list_active_by_region(self, region: str) -> Sequence[Referral]:
        """Viloyat OvaBMU dispetcheri uchun butun viloyat bo'yicha faol murojaatlar."""
        pass

    @abstractmethod
    async def get_counts_by_status(self, facility_id: UUID | None = None) -> dict[str, int]:
        """Dashboard uchun statistik sonlar (open, resolved, escalated)."""
        pass


class FacilityRepository(ABC):
    @abstractmethod
    async def get_by_id(self, facility_id: UUID) -> Facility | None:
        pass

    @abstractmethod
    async def get_regional_center(self, region: str) -> Facility | None:
        pass

    @abstractmethod
    async def list_all(self) -> Sequence[Facility]:
        """Frontendda dropdown tanlash (ro'yxatdan o'tish) uchun."""
        pass

    @abstractmethod
    async def list_by_region(self, region: str) -> Sequence[Facility]:
        pass

    @abstractmethod
    async def add(self, facility: Facility) -> None:
        pass


class StaffRepository(ABC):
    @abstractmethod
    async def get_by_id(self, staff_id: UUID) -> StaffMember | None:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> StaffMember | None:
        pass

    @abstractmethod
    async def get_with_credentials(self, email: str) -> tuple[StaffMember, str] | None:
        pass

    @abstractmethod
    async def add(self, staff: StaffMember, hashed_password: str) -> None:
        pass
