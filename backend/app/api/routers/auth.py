from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import (
    cache_instance,
    get_current_user,
    get_uow,
    hasher_instance,
    oauth2_scheme,
    token_instance,
)
from app.api.schemas import StaffLoginRequest, StaffRegisterRequest, TokenResponse
from app.application.use_cases.auth import LoginUseCase, LogoutUseCase, RegisterStaffUseCase
from app.domain.entities.staff import StaffMember

router = APIRouter(prefix="/auth", tags=["Autentifikatsiya"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: StaffRegisterRequest, uow=Depends(get_uow)):
    use_case = RegisterStaffUseCase(uow=uow, hasher=hasher_instance)
    try:
        staff = await use_case.execute(
            full_name=req.full_name,
            email=req.email,
            password=req.password,
            role=req.role,
            facility_id=req.facility_id,
            telegram_user_id=req.telegram_user_id,
        )
        return {
            "id": staff.id,
            "email": staff.email,
            "message": "Xodim muvaffaqiyatli ro'yxatdan o'tdi",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: StaffLoginRequest, uow=Depends(get_uow)):
    use_case = LoginUseCase(uow=uow, hasher=hasher_instance, token_port=token_instance)
    try:
        return await use_case.execute(email=req.email, password=req.password)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    current_user: StaffMember = Depends(get_current_user),
):
    use_case = LogoutUseCase(cache=cache_instance, token_port=token_instance)
    await use_case.execute(token)
    return {"message": "Sessiya muvaffaqiyatli yakunlandi"}


@router.get("/me")
async def get_me(current_user: StaffMember = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "facility_id": current_user.facility_id,
    }
