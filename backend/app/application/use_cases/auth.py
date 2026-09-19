from uuid import UUID

from app.application.ports.cache import CachePort
from app.application.ports.security import PasswordHasherPort, TokenPort
from app.application.ports.unit_of_work import UnitOfWorkPort
from app.domain.entities.staff import StaffMember
from app.domain.exceptions.domain_exceptions import DomainError
from app.domain.value_objects.perinatal import UserRole


class StaffAlreadyExistsError(DomainError):
    def __init__(self, email: str):
        super().__init__(f"Foydalanuvchi allaqachon mavjud: {email}")


class FacilityNotFoundError(DomainError):
    def __init__(self, facility_id: UUID):
        super().__init__(f"Muassasa topilmadi: {facility_id}")


class InvalidCredentialsError(DomainError):
    def __init__(self):
        super().__init__("Email yoki parol noto'g'ri.")


class RegisterStaffUseCase:
    def __init__(self, uow: UnitOfWorkPort, hasher: PasswordHasherPort):
        self.uow = uow
        self.hasher = hasher

    async def execute(
        self,
        full_name: str,
        email: str,
        password: str,
        role: UserRole,
        facility_id: UUID,
        telegram_user_id: str | None = None,
    ) -> StaffMember:
        async with self.uow:
            facility = await self.uow.facilities.get_by_id(facility_id)
            if not facility:
                raise FacilityNotFoundError(facility_id)

            existing = await self.uow.staff.get_by_email(email)
            if existing:
                raise StaffAlreadyExistsError(email)

            hashed_password = self.hasher.hash(password)
            staff = StaffMember(
                full_name=full_name,
                email=email,
                role=role,
                facility_id=facility_id,
                telegram_user_id=telegram_user_id,
            )

            await self.uow.staff.add(staff, hashed_password=hashed_password)
            await self.uow.commit()
            return staff


class LoginUseCase:
    def __init__(self, uow: UnitOfWorkPort, hasher: PasswordHasherPort, token_port: TokenPort):
        self.uow = uow
        self.hasher = hasher
        self.token_port = token_port

    async def execute(self, email: str, password: str) -> dict[str, str]:
        async with self.uow:
            user_data = await self.uow.staff.get_with_credentials(email)
            if not user_data:
                raise InvalidCredentialsError()

            staff, hashed_password = user_data
            if not self.hasher.verify(password, hashed_password):
                raise InvalidCredentialsError()

            payload = {
                "sub": str(staff.id),
                "role": staff.role.value,
                "facility_id": str(staff.facility_id),
            }
            access_token = self.token_port.create_access_token(payload)
            return {"access_token": access_token, "token_type": "bearer", "role": staff.role.value}


class LogoutUseCase:
    def __init__(self, cache: CachePort, token_port: TokenPort):
        self.cache = cache
        self.token_port = token_port

    async def execute(self, token: str) -> None:
        try:
            payload = self.token_port.decode_token(token)
            ttl = payload.get("exp_seconds", 3600)
            await self.cache.blacklist_token(token, expire_seconds=ttl)
        except Exception:
            pass
