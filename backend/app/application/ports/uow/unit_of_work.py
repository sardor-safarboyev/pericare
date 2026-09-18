from abc import ABC, abstractmethod

from app.application.ports.repositories.assessment import IRiskAssessmentRepository
from app.application.ports.repositories.patient import IPatientRepository
from app.application.ports.repositories.user import IUserRepository
from app.application.ports.repositories.vitals import IVitalsRepository


class IUnitOfWork(ABC):
    users: IUserRepository
    patients: IPatientRepository
    vitals: IVitalsRepository
    assessments: IRiskAssessmentRepository

    @abstractmethod
    async def __aenter__(self) -> "IUnitOfWork":
        pass

    @abstractmethod
    async def __aexit__(self, exc_type, exc_val, traceback) -> None:
        pass

    @abstractmethod
    async def commit(self) -> None:
        pass

    @abstractmethod
    async def rollback(self) -> None:
        pass
