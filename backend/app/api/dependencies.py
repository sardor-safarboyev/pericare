from fastapi import Request

from app.application.ports.services.prediction import IPredictionService
from app.application.ports.services.security import ISecurityService
from app.application.ports.services.worker import ITaskQueue

# Portlarni chaqiramiz
from app.application.ports.uow.unit_of_work import IUnitOfWork

# Eslatma: Haqiqiy obyektlar dastur ishga tushganda FastAPI app.state
# yoki maxsus DI konteyner orqali ulanadi (Infrastructure qatlami yozilgach).


def get_uow(request: Request) -> IUnitOfWork:
    return request.app.state.uow


def get_security_service(request: Request) -> ISecurityService:
    return request.app.state.security_service


def get_prediction_service(request: Request) -> IPredictionService:
    return request.app.state.prediction_service


def get_task_queue(request: Request) -> ITaskQueue:
    return request.app.state.task_queue
