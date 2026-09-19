import os
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.domain.entities.staff import StaffMember
from app.infrastructure.adapters.ml_predictor_adapter import LightGBMRiskPredictor
from app.infrastructure.adapters.ocr_adapter import TesseractOCRAdapter
from app.infrastructure.adapters.redis_cache_adapter import RedisCacheAdapter
from app.infrastructure.adapters.security_adapter import BcryptPasswordHasher, JWTTokenAdapter
from app.infrastructure.adapters.worker_adapter import CeleryWorkerAdapter
from app.infrastructure.database.session import AsyncSessionFactory
from app.infrastructure.database.unit_of_work import SqlUnitOfWork

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-perisafe-key-2026")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

hasher_instance = BcryptPasswordHasher()
token_instance = JWTTokenAdapter(secret_key=JWT_SECRET)
cache_instance = RedisCacheAdapter(redis_url=REDIS_URL)
worker_instance = CeleryWorkerAdapter()
ocr_instance = TesseractOCRAdapter()
ml_instance = LightGBMRiskPredictor()


def get_uow() -> SqlUnitOfWork:
    return SqlUnitOfWork(AsyncSessionFactory)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    uow: SqlUnitOfWork = Depends(get_uow),
) -> StaffMember:
    # 1. Redis qora ro'yxatini tekshirish
    if await cache_instance.is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token bekor qilingan (chiqib ketilgan)",
        )

    # 2. JWT decode qilish
    try:
        payload = token_instance.decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yaroqsiz token",
        )

    # 3. Foydalanuvchini bazadan tekshirish
    async with uow:
        staff = await uow.staff.get_by_id(UUID(user_id))
        if not staff or not staff.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Foydalanuvchi faol emas yoki mavjud emas",
            )
        return staff
