from abc import ABC, abstractmethod

from app.domain.entities import Patient, RiskAssessment, VitalsReading


class IPredictionService(ABC):
    @abstractmethod
    async def predict_risk(self, vitals: VitalsReading, patient: Patient) -> RiskAssessment:
        pass
