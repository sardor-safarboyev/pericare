from typing import Any

from celery import Celery

from app.application.ports.services.worker import ITaskQueue


class CeleryTaskQueue(ITaskQueue):
    def __init__(self, celery_app: Celery):
        self.celery_app = celery_app

    def enqueue_task(self, task_name: str, *args: Any, **kwargs: Any) -> None:
        # Celery orqali asinxron vazifani fonga yuborish
        self.celery_app.send_task(task_name, args=args, kwargs=kwargs)
