import asyncio
import os

import httpx

from app.worker.celery_app import celery

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")


async def _send_tg_message(chat_id: str, text: str):
    if not TELEGRAM_BOT_TOKEN:
        print(f"[TG_MOCK] To: {chat_id} | Text: {text}")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})


@celery.task(name="send_telegram_alert_task")
def send_telegram_alert_task(chat_id: str, message: str):
    asyncio.run(_send_tg_message(chat_id, message))


@celery.task(name="audit_sla_timeouts_task")
def audit_sla_timeouts_task():
    """Fon rejimida har daqiqada SLA muddati o'tgan holatlarni tekshiradi."""
    from app.application.use_cases.referrals import AuditSLATimeoutsUseCase
    from app.infrastructure.adapters.worker_adapter import CeleryWorkerAdapter
    from app.infrastructure.database.session import AsyncSessionFactory
    from app.infrastructure.database.unit_of_work import SqlUnitOfWork

    async def _run():
        uow = SqlUnitOfWork(AsyncSessionFactory)
        worker = CeleryWorkerAdapter()
        use_case = AuditSLATimeoutsUseCase(uow=uow, worker=worker)
        escalated_count = await use_case.execute()
        if escalated_count > 0:
            print(f"[SLA_AUDIT] {escalated_count} ta holat viloyat darajasiga ko'tarildi.")

    asyncio.run(_run())
