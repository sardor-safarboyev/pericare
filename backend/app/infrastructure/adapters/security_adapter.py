from datetime import datetime, timedelta
from typing import Any

import jwt
from passlib.context import CryptContext

from app.application.ports.security import PasswordHasherPort, TokenPort

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class BcryptPasswordHasher(PasswordHasherPort):
    def hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)


class JWTTokenAdapter(TokenPort):
    def __init__(
        self, secret_key: str, algorithm: str = "HS256", default_expiry_minutes: int = 120
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.default_expiry_minutes = default_expiry_minutes

    def create_access_token(
        self, payload: dict[str, Any], expires_minutes: int | None = None
    ) -> str:
        data = payload.copy()
        expire = datetime.now() + timedelta(minutes=expires_minutes or self.default_expiry_minutes)
        data.update({"exp": expire, "exp_seconds": int((expire - datetime.now()).total_seconds())})
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> dict[str, Any]:
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
