from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities import User


class IUserRepository(ABC):
    @abstractmethod
    async def add(self, user: User) -> None:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        pass
