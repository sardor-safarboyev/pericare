import asyncio
import json
import os

import joblib
import shap
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    brier_score_loss,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from xgboost import XGBClassifier

from app.infrastructure.ml.dataset import load_or_generate_dataset, prepare_features

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)


def build_stacking_ensemble() -> StackingClassifier:
    """LightGBM + XGBoost + CatBoost ansambli va LogisticRegression meta-learner."""
    base_learners = [
        (
            "lgbm",
            LGBMClassifier(
                objective="multiclass",
                num_class=3,
                n_estimators=100,
                learning_rate=0.05,
                max_depth=4,
                class_weight="balanced",
                random_state=42,
                verbose=-1,
            ),
        ),
        (
            "xgb",
            XGBClassifier(
                objective="multi:softprob",
                num_class=3,
                n_estimators=100,
                learning_rate=0.05,
                max_depth=4,
                eval_metric="mlogloss",
                random_state=42,
            ),
        ),
        (
            "cat",
            CatBoostClassifier(
                iterations=100,
                learning_rate=0.05,
                depth=4,
                loss_function="MultiClass",
                auto_class_weights="Balanced",
                random_seed=42,
                verbose=False,
            ),
        ),
    ]

    meta_learner = LogisticRegression(max_iter=1000, random_state=42)

    return StackingClassifier(
        estimators=base_learners,
        final_estimator=meta_learner,
        cv=5,
        stack_method="predict_proba",
        n_jobs=-1,
    )


async def train_and_evaluate():
    print("=" * 60)
    print("  PeriSafe: Stacking Ensemble Training & Clinical Evaluation")
    print("=" * 60)

    df = await load_or_generate_dataset()
    (X_train, X_test, y_train, y_test), feature_cols = prepare_features(df)

    ensemble = build_stacking_ensemble()

    # 1. Stratified 5-Fold Cross-Validation (Trening paytidagi barqarorlik)
    print("\n[*] 5-Fold Stratified Cross-Validation boshlanmoqda...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(ensemble, X_train, y_train, cv=cv, scoring="f1_macro", n_jobs=-1)
    print(f"[*] CV Macro F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # 2. To'liq trening to'plamida o'qitish
    print("\n[*] Asosiy model o'qitilmoqda...")
    ensemble.fit(X_train, y_train)

    # 3. Test to'plamida bashorat va metrikalar
    y_pred = ensemble.predict(X_test)
    y_prob = ensemble.predict_proba(X_test)

    # Multiclass ROC-AUC (One-vs-Rest)
    roc_auc = roc_auc_score(y_test, y_prob, multi_class="ovr", average="macro")
    macro_f1 = f1_score(y_test, y_pred, average="macro")

    # Brier Score (Kalibratsiya xatoligi - Qizil zona uchun alohida)
    y_test_bin_red = (y_test == 2).astype(int)
    red_prob = y_prob[:, 2]
    red_brier = brier_score_loss(y_test_bin_red, red_prob)

    print("\n" + "-" * 45)
    print(f"  ROC-AUC (Macro OvR)        : {roc_auc:.4f}")
    print(f"  Macro F1-Score             : {macro_f1:.4f}")
    print(
        f"  Qizil Zona Brier Score     : {red_brier:.4f} (0 ga qanchalik yaqin bo'lsa, shuncha aniq)"
    )
    print("-" * 45)

    print("\n[*] To'liq Klinik Klassifikatsiya Hisoboti:")
    print(classification_report(y_test, y_pred, target_names=["Yashil", "Sariq", "Qizil"]))

    print("[*] Confusion Matrix (Satrlar: Haqiqiy, Ustunlar: Bashorat):")
    print(confusion_matrix(y_test, y_pred))

    # 4. SHAP Explainer (Ansambldagi eng tezkor LightGBM bo'yicha hisoblanadi)
    print("\n[*] SHAP TreeExplainer generatsiya qilinmoqda...")
    lgbm_fitted = ensemble.named_estimators_["lgbm"]
    explainer = shap.TreeExplainer(lgbm_fitted)

    # 5. Artefaktlarni saqlash
    model_path = os.path.join(MODEL_DIR, "stacking_ensemble.joblib")
    explainer_path = os.path.join(MODEL_DIR, "shap_explainer.joblib")
    features_path = os.path.join(MODEL_DIR, "feature_names.json")
    metrics_path = os.path.join(MODEL_DIR, "evaluation_metrics.json")

    joblib.dump(ensemble, model_path)
    joblib.dump(explainer, explainer_path)
    with open(features_path, "w") as f:
        json.dump(feature_cols, f)

    # Baholash metrikalarini JSON ga saqlab qo'yish (Frontend yoki Swagger uchun)
    metrics_data = {
        "cv_macro_f1": round(float(cv_scores.mean()), 4),
        "test_roc_auc": round(float(roc_auc), 4),
        "test_macro_f1": round(float(macro_f1), 4),
        "red_brier_score": round(float(red_brier), 4),
    }
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"\n[MUVAFFAQINAT] Model, SHAP va Baholash metrikalari saqlandi: {MODEL_DIR}")


if __name__ == "__main__":
    asyncio.run(train_and_evaluate())
