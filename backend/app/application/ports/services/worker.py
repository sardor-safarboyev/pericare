from abc import ABC, abstractmethod
from typing import Any


class ITaskQueue(ABC):
    @abstractmethod
    def enqueue_task(self, task_name: str, *args: Any, **kwargs: Any) -> None:
        """
        Vazifani fonga (Worker'ga) yuborish.
        Masalan: enqueue_task("send_telegram_alert", assessment_id)
        """
        pass
