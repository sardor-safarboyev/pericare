from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_security_service, get_uow
from app.application.ports.services.security import ISecurityService
from app.application.ports.uow.unit_of_work import IUnitOfWork
from app.application.use_cases.auth import LoginUseCase
from app.domain.exceptions import DomainException

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(
    request: LoginRequest,
    uow: IUnitOfWork = Depends(get_uow),
    security: ISecurityService = Depends(get_security_service),
):
    use_case = LoginUseCase(uow=uow, security=security)
    try:
        token = await use_case.execute(email=request.email, plain_password=request.password)
        return {"access_token": token, "token_type": "bearer"}
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
