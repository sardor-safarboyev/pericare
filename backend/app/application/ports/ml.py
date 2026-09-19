from abc import ABC, abstractmethod

from pydantic import BaseModel

from app.domain.entities.vitals import VitalsReading


class MLPredictionResult(BaseModel):
    risk_probability: float
    predicted_zone: str  # yashil, sariq, qizil
    top_shap_factors: dict[str, str]  # masalan: {"systolic_bp": "+35%", "proteinuria": "+25%"}


class RiskPredictorPort(ABC):
    @abstractmethod
    def predict_risk(
        self,
        current_vitals: VitalsReading,
        history: list[VitalsReading] | None = None,
    ) -> MLPredictionResult:
        """LightGBM + SHAP TreeExplainer orqali xavf va tushuntirishlarni hisoblaydi."""
        pass
