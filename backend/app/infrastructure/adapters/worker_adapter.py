from uuid import UUID

from app.application.ports.worker import WorkerPort
from app.worker.tasks import send_telegram_alert_task


class CeleryWorkerAdapter(WorkerPort):
    async def enqueue_triage_alert(
        self,
        referral_id: UUID,
        target_chat_id: str,
        risk_zone: str,
        syndrome: str,
        sla_minutes: int,
    ) -> None:
        msg = (
            f"🚨 *PERINATAL XAVF: {risk_zone.upper()}*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"📌 Sindrom: *{syndrome}*\n"
            f"⏱ Javob berish vaqti (SLA): *{sla_minutes} daqiqa*\n"
            f"🆔 Referral ID: `{referral_id}`\n\n"
            f"Zudlik bilan protokol chorasini belgilang!"
        )
        send_telegram_alert_task.delay(target_chat_id, msg)

    async def enqueue_escalation_alert(
        self,
        referral_id: UUID,
        target_facility_chat_id: str,
        urgency_level: str,
    ) -> None:
        msg = (
            f"⚠️ *DIQQAT: SLA MUDDATI BUZILDI!*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"Tuman shifoxonasi 60 daqiqa ichida javob bermadi.\n"
            f"Holat avtomatik ravishda viloyat monitoringiga ko'tarildi!\n"
            f"🆔 Referral: `{referral_id}`"
        )
        send_telegram_alert_task.delay(target_facility_chat_id, msg)
