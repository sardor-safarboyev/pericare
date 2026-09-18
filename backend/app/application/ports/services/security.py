from abc import ABC, abstractmethod
from typing import Any, Dict


class ISecurityService(ABC):
    @abstractmethod
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        pass

    @abstractmethod
    def get_password_hash(self, password: str) -> str:
        pass

    @abstractmethod
    def create_access_token(self, payload: Dict[str, Any]) -> str:
        pass
