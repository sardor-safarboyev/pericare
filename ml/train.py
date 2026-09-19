import numpy as np
import pandas as pd
import lightgbm as lgb
import joblib
import shap
import os

print("1. Sintetik tibbiy ma'lumotlarni generatsiya qilish...")
np.random.seed(42)
n_samples = 1000

# Features: age, gestational_week, systolic, diastolic, proteinuria (0-4)
X = pd.DataFrame(
    {
        "age": np.random.randint(18, 45, n_samples),
        "gestational_week": np.random.randint(20, 42, n_samples),
        "systolic": np.random.normal(120, 15, n_samples),
        "diastolic": np.random.normal(80, 10, n_samples),
        "proteinuria": np.random.choice(
            [0, 1, 2, 3, 4], n_samples, p=[0.7, 0.15, 0.08, 0.05, 0.02]
        ),
        "history_hypertension": np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
    }
)

# Mantiqiy Target (Risk ehtimolligi): Qon bosimi baland va oqsil ko'p bo'lsa xavf oshadi
risk_score = (
    (X["systolic"] / 160) * 0.4
    + (X["diastolic"] / 110) * 0.3
    + (X["proteinuria"] / 4) * 0.2
    + (X["history_hypertension"]) * 0.1
)
y = (risk_score + np.random.normal(0, 0.05, n_samples) > 0.8).astype(int)

print("2. LightGBM modelini o'qitish...")
model = lgb.LGBMClassifier(n_estimators=50, random_state=42)
model.fit(X, y)

print("3. SHAP Explainer yaratish...")
explainer = shap.TreeExplainer(model)

print("4. Model va Explainer'ni saqlash...")
artifacts_dir = "../backend/app/infrastructure/ml/artifacts"
os.makedirs(artifacts_dir, exist_ok=True)

joblib.dump(model, f"{artifacts_dir}/lgbm_model.joblib")
joblib.dump(explainer, f"{artifacts_dir}/shap_explainer.joblib")
print("✅ ML Model tayyor va backend ichiga saqlandi!")
