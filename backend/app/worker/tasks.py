from app.worker.celery_app import celery_app

# KELAJAKDA: Bu yerga NotificationService va UoW chaqiriladi
# from app.infrastructure.db.uow import SQLAlchemyUnitOfWork
# from app.infrastructure.notifications.telegram import TelegramNotificationService


@celery_app.task(name="send_alert_notification")
def handle_send_alert_notification(assessment_id: str, zone: str, district: str):
    """
    Worker uchun Entrypoint.
    Xuddi API router kabi, bu yerda ham UoW va Service lar inyeksiya qilinib,
    Use Case ishga tushiriladi.
    """
    print(f"[URGENT] Alert received for assessment {assessment_id}")
    print(f"Zone: {zone}, District: {district}")

    # DI qismi (Infrastructure yozilgach, haqiqiy obyektlar ulanadi)
    # uow = SQLAlchemyUnitOfWork(...)
    # notification_service = TelegramNotificationService(...)
    # use_case = SendAlertUseCase(uow, notification_service)
    # use_case.execute(assessment_id)

    return {"status": "alert_processed", "assessment_id": assessment_id}
