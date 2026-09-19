export const ROLE_LABELS = {
    doctor: "Doctor",
    midwife: "Midwife",
    triage_nurse: "Triage Nurse",
};
export const FACILITY_LABELS = {
    primary_care: "Primary Care Unit",
    district_maternity: "District Maternity",
    tertiary_perinatal: "Tertiary Perinatal Center",
};
export const SYNDROME_LABELS = {
    none: "No Syndrome Detected",
    gestational_hypertension: "Gestational Hypertension",
    preeclampsia: "Preeclampsia",
    severe_preeclampsia: "Severe Preeclampsia",
    eclampsia: "Eclampsia",
    postpartum_hemorrhage: "Postpartum Hemorrhage",
    sepsis: "Maternal Sepsis",
};
export const RISK_LABELS = {
    green: "Low Risk",
    yellow: "Moderate Risk",
    red: "Critical",
};
export const PROTEINURIA_LEVELS = ["negative", "trace", "1+", "2+", "3+", "4+"];
export const REFERRAL_STATUS_LABELS = {
    pending: "Pending",
    in_transit: "In Transit",
    admitted: "Admitted",
};
export const REFERRAL_ACTION_LABELS = {
    magnesium_sulfate: "Magnesium Sulfate Administered",
    anti_hypertensive: "Anti-hypertensive Given",
    icu_bed_requested: "ICU Bed Requested",
    ambulance_dispatched: "Ambulance Dispatched",
};
export function riskClasses(zone) {
    switch (zone) {
        case "green":
            return {
                text: "text-safe",
                bg: "bg-safe-muted",
                badge: "bg-safe-muted text-safe border border-safe/20",
                solid: "bg-safe text-safe-foreground",
                dot: "bg-safe",
                ring: "ring-safe/30",
            };
        case "yellow":
            return {
                text: "text-moderate",
                bg: "bg-moderate-muted",
                badge: "bg-moderate-muted text-moderate border border-moderate/20",
                solid: "bg-moderate text-moderate-foreground",
                dot: "bg-moderate",
                ring: "ring-moderate/30",
            };
        case "red":
            return {
                text: "text-critical",
                bg: "bg-critical-muted",
                badge: "bg-critical-muted text-critical border border-critical/20",
                solid: "bg-critical text-critical-foreground",
                dot: "bg-critical",
                ring: "ring-critical/30",
            };
    }
}
const PROTEINURIA_SCORE = {
    negative: 0,
    trace: 1,
    "1+": 2,
    "2+": 3,
    "3+": 4,
    "4+": 5,
};
export function shockIndex(hr, sbp) {
    if (!sbp)
        return 0;
    return Number((hr / sbp).toFixed(2));
}
export function shockIndexBand(si) {
    if (si < 0.7)
        return { label: "Normal", zone: "green" };
    if (si <= 0.9)
        return { label: "Borderline", zone: "yellow" };
    return { label: "Shock", zone: "red" };
}
/**
 * Deterministic mock of the FastAPI stacking-classifier triage evaluation.
 * Produces a risk zone, likely obstetric syndrome and SHAP-style contributions.
 */
export function evaluateVitals(vitals, previousPreeclampsia = false) {
    const si = shockIndex(vitals.heartRate, vitals.systolic);
    const protein = PROTEINURIA_SCORE[vitals.proteinuria];
    const factors = [];
    let score = 0;
    const sbpContribution = vitals.systolic >= 160 ? 0.34 : vitals.systolic >= 140 ? 0.2 : -0.1;
    score += sbpContribution;
    factors.push({ feature: "Systolic BP", contribution: sbpContribution });
    const dbpContribution = vitals.diastolic >= 110 ? 0.24 : vitals.diastolic >= 90 ? 0.14 : -0.06;
    score += dbpContribution;
    factors.push({ feature: "Diastolic BP", contribution: dbpContribution });
    const proteinContribution = protein >= 4 ? 0.22 : protein >= 2 ? 0.12 : protein >= 1 ? 0.04 : -0.05;
    score += proteinContribution;
    factors.push({ feature: "Proteinuria", contribution: proteinContribution });
    const siContribution = si > 0.9 ? 0.26 : si >= 0.7 ? 0.12 : -0.08;
    score += siContribution;
    factors.push({ feature: "Shock Index", contribution: siContribution });
    const spo2Contribution = vitals.spo2 < 92 ? 0.18 : vitals.spo2 < 95 ? 0.08 : -0.04;
    score += spo2Contribution;
    factors.push({ feature: "SpO2", contribution: spo2Contribution });
    const tempContribution = vitals.temperature >= 38 ? 0.12 : vitals.temperature < 36 ? 0.08 : -0.03;
    score += tempContribution;
    factors.push({ feature: "Temperature", contribution: tempContribution });
    const historyContribution = previousPreeclampsia ? 0.1 : 0;
    if (previousPreeclampsia) {
        score += historyContribution;
        factors.push({ feature: "Prior Preeclampsia", contribution: historyContribution });
    }
    const probability = Math.max(0.02, Math.min(0.98, 0.4 + score));
    let riskZone = "green";
    if (probability >= 0.7)
        riskZone = "red";
    else if (probability >= 0.45)
        riskZone = "yellow";
    let syndrome = "none";
    if (vitals.spo2 < 90 && vitals.heartRate > 110)
        syndrome = "postpartum_hemorrhage";
    else if (vitals.temperature >= 38.5 && vitals.heartRate > 100)
        syndrome = "sepsis";
    else if (vitals.systolic >= 160 && protein >= 3)
        syndrome = "eclampsia";
    else if (vitals.systolic >= 160 || vitals.diastolic >= 110)
        syndrome = "severe_preeclampsia";
    else if ((vitals.systolic >= 140 || vitals.diastolic >= 90) && protein >= 1)
        syndrome = "preeclampsia";
    else if (vitals.systolic >= 140 || vitals.diastolic >= 90)
        syndrome = "gestational_hypertension";
    const recommendation = riskZone === "red"
        ? "Initiate emergency escalation. Administer magnesium sulfate and arrange immediate transfer to a tertiary center."
        : riskZone === "yellow"
            ? "Increase monitoring frequency, repeat BP in 15 minutes and review within the hour."
            : "Continue routine antenatal monitoring. Re-screen at next scheduled visit.";
    factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    return {
        riskZone,
        syndrome,
        shockIndex: si,
        probability: Number(probability.toFixed(2)),
        recommendation,
        shapFactors: factors,
        vitals,
    };
}
export function formatRelativeTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1)
        return "just now";
    if (mins < 60)
        return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
}
export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
