from app.application.ports.services.security import ISecurityService
from app.application.ports.uow.unit_of_work import IUnitOfWork
from app.domain.entities import Role, User
from app.domain.exceptions import DomainException


class LoginUseCase:
    def __init__(
        self,
        uow: IUnitOfWork,
        security: ISecurityService,
    ):
        self.uow = uow
        self.security = security

    async def execute(self, email: str, plain_password: str) -> str:
        async with self.uow:
            user = await self.uow.users.get_by_email(email)

            # Eslatma: Haqiqiy tizimda 'hashed_password' User entity'da yoki DB'da bo'ladi.
            if not user or not self.security.verify_password(
                plain_password, getattr(user, "hashed_password", "")
            ):
                raise DomainException("Email yoki parol noto'g'ri")

            if not user.is_active:
                raise DomainException("Foydalanuvchi bloklangan")

            token_payload = {
                "sub": str(user.id),
                "role": user.role.value,
                "district": user.district,
            }
            return self.security.create_access_token(token_payload)


class RegisterUserUseCase:
    def __init__(
        self,
        uow: IUnitOfWork,
        security: ISecurityService,
    ):
        self.uow = uow
        self.security = security

    async def execute(
        self, email: str, password: str, full_name: str, role: Role, district: str = None
    ) -> User:
        async with self.uow:
            existing_user = await self.uow.users.get_by_email(email)
            if existing_user:
                raise DomainException("Bu email allaqachon ro'yxatdan o'tgan")

            hashed_pw = self.security.get_password_hash(password)
            user = User(email=email, full_name=full_name, role=role, district=district)

            await self.uow.users.add(user, hashed_pw)
            await self.uow.commit()

            return user
