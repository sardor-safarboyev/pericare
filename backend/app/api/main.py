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
