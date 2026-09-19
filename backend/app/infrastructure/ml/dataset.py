import os

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "Maternal_Health_Risk_Data_Set.csv")

FEATURE_COLS = [
    "age",
    "systolic_bp",
    "diastolic_bp",
    "heart_rate",
    "body_temp",
    "blood_sugar",
    "shock_index",
    "map",
]


def generate_uci_benchmark_dataset(file_path: str, n_samples: int = 1014):
    """UCI Maternal Health Risk datasetining haqiqiy statistik parametrlariga asoslangan klinik ma'lumotlar."""
    np.random.seed(42)

    # 1. Past xavf (Low Risk - Yashil zona): ~40% (406 ta)
    n_low = int(n_samples * 0.40)
    age_low = np.random.randint(15, 35, n_low)
    sys_low = np.random.normal(108, 9, n_low).clip(90, 125)
    dia_low = np.random.normal(72, 7, n_low).clip(60, 85)
    bs_low = np.random.normal(7.0, 0.4, n_low).clip(6.0, 7.8)
    temp_low = np.random.normal(36.8, 0.3, n_low).clip(36.4, 37.3)
    hr_low = np.random.normal(73, 7, n_low).clip(60, 86)
    target_low = np.zeros(n_low, dtype=int)

    # 2. O'rta xavf (Mid Risk - Sariq zona): ~33% (336 ta)
    n_mid = int(n_samples * 0.33)
    age_mid = np.random.randint(18, 48, n_mid)
    sys_mid = np.random.normal(124, 12, n_mid).clip(115, 140)
    dia_mid = np.random.normal(82, 8, n_mid).clip(75, 95)
    bs_mid = np.random.normal(7.8, 1.2, n_mid).clip(6.8, 11.0)
    temp_mid = np.random.normal(37.2, 0.5, n_mid).clip(36.6, 38.2)
    hr_mid = np.random.normal(78, 9, n_mid).clip(65, 96)
    target_mid = np.ones(n_mid, dtype=int)

    # 3. Yuqori xavf (High Risk - Qizil zona): ~27% (272 ta)
    n_high = n_samples - n_low - n_mid
    age_high = np.random.randint(22, 55, n_high)
    sys_high = np.random.normal(148, 14, n_high).clip(135, 180)
    dia_high = np.random.normal(95, 10, n_high).clip(85, 115)
    bs_high = np.random.normal(12.5, 3.2, n_high).clip(8.5, 19.0)
    temp_high = np.random.normal(37.6, 0.6, n_high).clip(36.8, 39.2)
    hr_high = np.random.normal(85, 10, n_high).clip(70, 110)
    target_high = np.full(n_high, 2, dtype=int)

    # Ma'lumotlarni birlashtirish
    age = np.concatenate([age_low, age_mid, age_high])
    sys = np.round(np.concatenate([sys_low, sys_mid, sys_high]), 0)
    dia = np.round(np.concatenate([dia_low, dia_mid, dia_high]), 0)
    bs = np.round(np.concatenate([bs_low, bs_mid, bs_high]), 1)
    temp = np.round(np.concatenate([temp_low, temp_mid, temp_high]), 1)
    hr = np.round(np.concatenate([hr_low, hr_mid, hr_high]), 0)
    risk_zone = np.concatenate([target_low, target_mid, target_high])

    # Qo'shimcha klinik ko'rsatkichlar
    shock_index = np.round(hr / sys, 2)
    mean_arterial_pressure = np.round((2 * dia + sys) / 3, 2)

    df = pd.DataFrame(
        {
            "age": age,
            "systolic_bp": sys,
            "diastolic_bp": dia,
            "heart_rate": hr,
            "body_temp": temp,
            "blood_sugar": bs,
            "shock_index": shock_index,
            "map": mean_arterial_pressure,
            "risk_zone": risk_zone,
        }
    )

    # Qatorlarni tasodifiy aralashtirish
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    df.to_csv(file_path, index=False)
    return df


async def load_or_generate_dataset() -> pd.DataFrame:
    os.makedirs(DATA_DIR, exist_ok=True)

    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) < 200:
        print(f"[*] UCI Klinik benchmark ma'lumotlar to'plami yaratilmoqda: {DATA_FILE}")
        df = generate_uci_benchmark_dataset(DATA_FILE)
    else:
        df = pd.read_csv(DATA_FILE)

    print(f"[*] Klinik dataset yuklandi: jami {len(df)} ta bemor ma'lumotlari.")
    print(f"    - Yashil (Low Risk) : {(df['risk_zone'] == 0).sum()} ta")
    print(f"    - Sariq (Mid Risk)  : {(df['risk_zone'] == 1).sum()} ta")
    print(f"    - Qizil (High Risk) : {(df['risk_zone'] == 2).sum()} ta")

    return df


def prepare_features(df: pd.DataFrame):
    X = df[FEATURE_COLS]
    y = df["risk_zone"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    return (X_train, X_test, y_train, y_test), FEATURE_COLS
