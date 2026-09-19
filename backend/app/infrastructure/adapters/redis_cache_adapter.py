import json
from typing import Any, Optional

import redis.asyncio as aioredis


class RedisCacheAdapter:
    def __init__(
        self, redis_url: Optional[str] = None, redis_client: Optional[aioredis.Redis] = None
    ):
        if redis_client is not None:
            self.redis = redis_client
        elif redis_url is not None:
            self.redis = aioredis.from_url(redis_url, decode_responses=False)
        else:
            self.redis = aioredis.from_url("redis://redis:6379/0", decode_responses=False)

    async def get(self, key: str) -> Optional[Any]:
        val = await self.redis.get(key)
        if val is None:
            return None
        try:
            return json.loads(val)
        except (ValueError, TypeError):
            return val.decode("utf-8") if isinstance(val, bytes) else val

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        if isinstance(value, (dict, list)):
            serialized = json.dumps(value)
        elif isinstance(value, str):
            serialized = value
        else:
            serialized = str(value)

        if ttl:
            await self.redis.setex(key, ttl, serialized)
        else:
            await self.redis.set(key, serialized)

    async def delete(self, key: str) -> None:
        await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        return bool(await self.redis.exists(key))

    async def is_token_blacklisted(self, token: str) -> bool:
        try:
            return bool(await self.redis.exists(f"blacklist:{token}"))
        except Exception:
            return False

    async def blacklist_token(
        self, token: str, expire_seconds: int = 86400, ttl_seconds: int | None = None
    ) -> None:
        exp = ttl_seconds if ttl_seconds is not None else expire_seconds
        try:
            await self.redis.setex(f"blacklist:{token}", exp, "true")
        except Exception:
            pass

    async def close(self) -> None:
        await self.redis.aclose()
