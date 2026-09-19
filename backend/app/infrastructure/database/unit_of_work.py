from types import TracebackType

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.application.ports.unit_of_work import UnitOfWorkPort
from app.infrastructure.repositories.sql_repositories import (
    SqlFacilityRepository,
    SqlPatientRepository,
    SqlReferralRepository,
    SqlRiskAssessmentRepository,
    SqlStaffRepository,
    SqlVitalsRepository,
)


class SqlUnitOfWork(UnitOfWorkPort):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        self.session_factory = session_factory
        self.session: AsyncSession | None = None

    async def __aenter__(self) -> "SqlUnitOfWork":
        self.session = self.session_factory()
        self.patients = SqlPatientRepository(self.session)
        self.vitals = SqlVitalsRepository(self.session)
        self.assessments = SqlRiskAssessmentRepository(self.session)
        self.referrals = SqlReferralRepository(self.session)
        self.facilities = SqlFacilityRepository(self.session)
        self.staff = SqlStaffRepository(self.session)
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        if self.session:
            if exc_type:
                await self.rollback()
            await self.session.close()

    async def flush(self) -> None:
        await self.session.flush()

    async def commit(self) -> None:
        if self.session:
            await self.session.commit()

    async def rollback(self) -> None:
        if self.session:
            await self.session.rollback()
