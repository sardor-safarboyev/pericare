from abc import ABC, abstractmethod
from types import TracebackType

from app.application.ports.repositories import (
    FacilityRepository,
    PatientRepository,
    ReferralRepository,
    RiskAssessmentRepository,
    StaffRepository,
    VitalsRepository,
)


class UnitOfWorkPort(ABC):
    patients: PatientRepository
    vitals: VitalsRepository
    assessments: RiskAssessmentRepository
    referrals: ReferralRepository
    facilities: FacilityRepository
    staff: StaffRepository

    @abstractmethod
    async def __aenter__(self) -> "UnitOfWorkPort":
        pass

    @abstractmethod
    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        pass

    @abstractmethod
    @abstractmethod
    async def flush(self) -> None:
        pass

    async def commit(self) -> None:
        pass

    @abstractmethod
    async def rollback(self) -> None:
        pass
