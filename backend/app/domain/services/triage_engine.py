from app.domain.entities.vitals import VitalsReading
from app.domain.value_objects.perinatal import (
    ObstetricSyndrome,
    ProteinuriaLevel,
    RiskZone,
)


class TriageEvaluationResult:
    def __init__(
        self,
        risk_zone: RiskZone,
        syndrome: ObstetricSyndrome,
        shock_index: float,
        velocity_score: float,
        top_factors: dict[str, str],
    ):
        self.risk_zone = risk_zone
        self.syndrome = syndrome
        self.shock_index = shock_index
        self.velocity_score = max(-99.0, min(99.0, round(float(velocity_score), 2)))
        self.top_factors = top_factors


class PerinatalTriageEngine:
    @staticmethod
    def evaluate(
        current: VitalsReading,
        history: list[VitalsReading] | None = None,
    ) -> TriageEvaluationResult:
        factors: dict[str, str] = {}
        si = current.shock_index

        # 1. Gemodinamik Shok tekshiruvi (CRADLE VSA standarti)
        if si >= 0.9:
            factors["shock_index"] = f"Shock Index kritik: {si} (Norma < 0.9)"
            return TriageEvaluationResult(
                risk_zone=RiskZone.QIZIL,
                syndrome=ObstetricSyndrome.HEMODYNAMIC_SHOCK,
                shock_index=si,
                velocity_score=max(-99.0, min(99.0, round(float(0.0), 2))),
                top_factors=factors,
            )

        # 2. Kritik Preeklampsiya (JSST standarti)
        is_severe_bp = (
            current.blood_pressure.systolic >= 160 or current.blood_pressure.diastolic >= 110
        )
        has_severe_protein = current.proteinuria in (
            ProteinuriaLevel.TWO_PLUS,
            ProteinuriaLevel.THREE_PLUS,
        )

        if is_severe_bp or (current.blood_pressure.systolic >= 140 and has_severe_protein):
            factors["blood_pressure"] = (
                f"{current.blood_pressure.systolic}/{current.blood_pressure.diastolic} mmHg"
            )
            factors["proteinuria"] = current.proteinuria.value
            return TriageEvaluationResult(
                risk_zone=RiskZone.QIZIL,
                syndrome=ObstetricSyndrome.PREECLAMPSIA,
                shock_index=si,
                velocity_score=max(-99.0, min(99.0, round(float(0.0), 2))),
                top_factors=factors,
            )

        # 3. Sepsis tekshiruvi (MEOWS)
        if current.body_temp >= 38.0 and current.heart_rate >= 100:
            factors["sepsis_trigger"] = (
                f"Harorat: {current.body_temp}°C, Puls: {current.heart_rate} bpm"
            )
            return TriageEvaluationResult(
                risk_zone=RiskZone.QIZIL,
                syndrome=ObstetricSyndrome.SEPSIS_RISK,
                shock_index=si,
                velocity_score=max(-99.0, min(99.0, round(float(0.0), 2))),
                top_factors=factors,
            )

        # 4. Trajectory / Delta tezligi (Oldingi ko'riklar bilan solishtirish)
        velocity = 0.0
        if history and len(history) > 0:
            latest_prev = history[-1]
            delta_sbp = current.blood_pressure.systolic - latest_prev.blood_pressure.systolic
            c_time = (
                current.recorded_at.replace(tzinfo=None)
                if current.recorded_at
                else datetime.utcnow()
            )
            p_time = (
                latest_prev.recorded_at.replace(tzinfo=None)
                if latest_prev.recorded_at
                else datetime.utcnow()
            )
            time_delta_days = max(1, (c_time - p_time).days)
            velocity = round((delta_sbp / time_delta_days) * 7, 2)  # Haftalik o'sish sur'ati

            if velocity >= 12.0:
                factors["velocity"] = f"Bosim o'sish tezligi: haftasiga +{velocity} mmHg"
                return TriageEvaluationResult(
                    risk_zone=RiskZone.SARIQ,
                    syndrome=ObstetricSyndrome.PREECLAMPSIA,
                    shock_index=si,
                    velocity_score=max(-99.0, min(99.0, round(float(velocity), 2))),
                    top_factors=factors,
                )

        # 5. Mo'tadil xavf (Sariq)
        if (
            current.blood_pressure.systolic >= 135
            or current.blood_pressure.diastolic >= 85
            or current.proteinuria == ProteinuriaLevel.ONE_PLUS
        ):
            factors["mild_hypertension"] = (
                f"{current.blood_pressure.systolic}/{current.blood_pressure.diastolic}"
            )
            return TriageEvaluationResult(
                risk_zone=RiskZone.SARIQ,
                syndrome=ObstetricSyndrome.PREECLAMPSIA,
                shock_index=si,
                velocity_score=max(-99.0, min(99.0, round(float(velocity), 2))),
                top_factors=factors,
            )

        return TriageEvaluationResult(
            risk_zone=RiskZone.YASHIL,
            syndrome=ObstetricSyndrome.NORMAL,
            shock_index=si,
            velocity_score=max(-99.0, min(99.0, round(float(velocity), 2))),
            top_factors={},
        )
