import json
import os

import joblib
import numpy as np
import pandas as pd

from app.application.ports.ml import MLPredictionResult
from app.domain.entities.vitals import VitalsReading

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


class MLInferenceEngine:
    def __init__(self):
        self.model_path = os.path.join(MODEL_DIR, "stacking_ensemble.joblib")
        self.explainer_path = os.path.join(MODEL_DIR, "shap_explainer.joblib")
        self.features_path = os.path.join(MODEL_DIR, "feature_names.json")

        self.model = None
        self.explainer = None
        self.feature_names = []
        self._load_artifacts()

    def _load_artifacts(self):
        if os.path.exists(self.model_path) and os.path.exists(self.explainer_path):
            self.model = joblib.load(self.model_path)
            self.explainer = joblib.load(self.explainer_path)
            with open(self.features_path, "r") as f:
                self.feature_names = json.load(f)

    def predict(
        self,
        current_vitals: VitalsReading,
        history: list[VitalsReading] | None = None,
        patient_age: int = 25,
    ) -> MLPredictionResult:
        if not self.model or not self.explainer:
            return MLPredictionResult(
                risk_probability=0.1,
                predicted_zone="yashil",
                top_shap_factors={
                    "status": "Ansambl modeli yuklanmagan, domen qoidalariga tayanilmoqda"
                },
            )

        row = {
            "age": patient_age,
            "systolic_bp": current_vitals.blood_pressure.systolic,
            "diastolic_bp": current_vitals.blood_pressure.diastolic,
            "heart_rate": current_vitals.heart_rate,
            "body_temp": current_vitals.body_temp,
            "blood_sugar": current_vitals.blood_sugar if current_vitals.blood_sugar else 5.2,
            "shock_index": current_vitals.shock_index,
            "map": current_vitals.blood_pressure.map_value,
        }

        df_input = pd.DataFrame([row])[self.feature_names]

        # Stacking modeldan ehtimolliklar
        probs = self.model.predict_proba(df_input)[0]  # [p_yashil, p_sariq, p_qizil]
        class_idx = int(np.argmax(probs))
        zones = ["yashil", "sariq", "qizil"]
        predicted_zone = zones[class_idx]
        risk_prob = float(probs[class_idx])

        # SHAP tushuntirishlari
        shap_values = self.explainer.shap_values(df_input)

        if isinstance(shap_values, list):
            target_shap = shap_values[class_idx][0]
        elif len(shap_values.shape) == 3:
            target_shap = shap_values[0, :, class_idx]
        else:
            target_shap = shap_values[0]

        feature_impact = dict(zip(self.feature_names, target_shap))
        sorted_factors = sorted(feature_impact.items(), key=lambda x: x[1], reverse=True)

        top_factors = {}
        for feat, val in sorted_factors[:2]:
            if val > 0:
                top_factors[feat] = f"+{round(val * 100, 1)}% yuklama ({row.get(feat)})"

        if not top_factors:
            top_factors["status"] = "Ko'rsatkichlar me'yoriy chegarada"

        return MLPredictionResult(
            risk_probability=round(risk_prob, 2),
            predicted_zone=predicted_zone,
            top_shap_factors=top_factors,
        )
