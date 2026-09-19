from fastapi import FastAPI

from app.api.routers import auth, triage

app = FastAPI(
    title="PeriSafe API", description="Perinatal Risk Monitoring & Triage System", version="1.0.0"
)

# Routerlarni ro'yxatdan o'tkazish
app.include_router(auth.router)
app.include_router(triage.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "PeriSafe API"}


from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, dashboard, patients, referrals, sync, triage
from app.infrastructure.database.models import Base
from app.infrastructure.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Jadvallarni avtomatik yaratish (Development/Hackathon rejimi)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="PeriSafe API",
    description="Milliy Perinatal Triage va Avtomatlashtirilgan Eskalatsiya Tizimi",
    version="1.0.0",
    lifespan=lifespan,
)

# PWA va Tashqi so'rovlar uchun CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routerlarni ulash
app.include_router(auth.router, prefix="/api/v1")
app.include_router(triage.router, prefix="/api/v1")
app.include_router(referrals.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(sync.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "PeriSafe Core Engine"}
