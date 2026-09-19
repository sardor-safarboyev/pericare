from abc import ABC, abstractmethod


class CachePort(ABC):
    @abstractmethod
    async def blacklist_token(self, token: str, ttl_seconds: int) -> None:
        """Chiqib ketilgan tokenni Redis qora ro'yxatiga kiritadi."""
        pass

    @abstractmethod
    async def is_token_blacklisted(self, token: str) -> bool:
        """Token qora ro'yxatda bor-yo'qligini tekshiradi."""
        pass
