from abc import ABC, abstractmethod
from typing import Any


class PasswordHasherPort(ABC):
    @abstractmethod
    def hash(self, password: str) -> str:
        """Xom parolni xeshlaydi."""
        pass

    @abstractmethod
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        """Xom parol va xeshni solishtiradi."""
        pass


class TokenPort(ABC):
    @abstractmethod
    def create_access_token(
        self, payload: dict[str, Any], expires_minutes: int | None = None
    ) -> str:
        """JWT access token yaratadi."""
        pass

    @abstractmethod
    def decode_token(self, token: str) -> dict[str, Any]:
        """JWT tokenni tekshiradi va payloadni qaytaradi."""
        pass
