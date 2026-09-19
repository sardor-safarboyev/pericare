from app.application.ports.ml import MLPredictionResult, RiskPredictorPort
from app.domain.entities.vitals import VitalsReading


class LightGBMRiskPredictor(RiskPredictorPort):
    """Xakaton tezkor versiyasi: Gradient Boosting qoidalarini simulyatsiya qiladi va SHAP omillarini beradi."""

    def predict_risk(
        self,
        current_vitals: VitalsReading,
        history: list[VitalsReading] | None = None,
    ) -> MLPredictionResult:
        sbp = current_vitals.blood_pressure.systolic
        si = current_vitals.shock_index
        factors: dict[str, str] = {}

        prob = 0.1
        if sbp >= 135:
            prob += 0.4
            factors["systolic_bp"] = "+40% gipertenziv yuklama"
        if si >= 0.8:
            prob += 0.35
            factors["shock_index"] = f"+35% gemodinamik beqarorlik (SI={si})"

        predicted_zone = "yashil"
        if prob >= 0.7:
            predicted_zone = "qizil"
        elif prob >= 0.4:
            predicted_zone = "sariq"

        return MLPredictionResult(
            risk_probability=round(min(prob, 0.99), 2),
            predicted_zone=predicted_zone,
            top_shap_factors=factors,
        )
