import type { RiskZone, Syndrome, ReferralStatus, ReferralActionType, ClinicalRole, FacilityType } from "./types"

export const RISK_LABELS: Record<RiskZone, string> = {
  green: "Normal (Me'yor)",
  yellow: "Moderate Risk (Nazorat)",
  red: "Critical Emergency (Kritik)",
}

export const SYNDROME_LABELS: Record<Syndrome, string> = {
  normal: "Normal Holat",
  gestational_hypertension: "Gestatsion Gipertenziya",
  preeclampsia: "Preeklampsiya",
  severe_preeclampsia: "Og'ir Preeklampsiya",
  eclampsia: "Eklampsiya",
  hemorrhage_shock: "Qon Ketish / Shok",
}

export const ROLE_LABELS: Record<ClinicalRole, string> = {
  midwife: "Akusher / Doya",
  nurse: "Akusher / Doya (Hamshira)",
  specialist: "Akusher-Ginekolog",
  district_specialist: "Tuman Akusher-Ginekologi",
  regional_specialist: "Viloyat Perinatal Markazi Mutaxassisi",
  facility: "Tug'ruqxona Qabulxona",
  auditor: "Sog'liqni Saqlash Nazoratchisi (Auditor)",
}

export const FACILITY_LABELS: Record<FacilityType, string> = {
  district_hospital: "Urganch TTB Markaziy Shifoxonasi",
  perinatal_center: "Xorazm Viloyat Perinatal Markazi",
  rural_point: "Qishloq Vrachlik Punkti (QVP)",
  district_maternity: "Urganch Tuman Tug'ruqxonasi",
}

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: "Kutilmoqda (Alert)",
  initiated: "Boshlandi",
  accepted: "Qabul qilindi",
  in_transit: "Yo'lda (Reanimobil)",
  admitted: "Qabul bo'limiga yotqizildi",
}

export const REFERRAL_ACTION_LABELS: Record<ReferralActionType, string> = {
  magnesium_sulfate: "Magniy Sulfat (MgSO4 4g IV)",
  anti_hypertensive: "Antigipertenziv dori (Nifedipin/Labetalol)",
  icu_bed_requested: "Reanimatsiya (ICU) o'rni so'raldi",
  ambulance_dispatched: "Reanimobil jo'natildi",
  stabilization_given: "Stabilizatsiya choralari",
  call: "Shifokor bilan qo'ng'iroq",
  note: "Klinik izoh qo'shildi",
}

export function riskClasses(zone: RiskZone) {
  if (zone === "red") {
    return {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      bg: "bg-rose-50/50",
      solid: "bg-rose-600 text-white",
    }
  }
  if (zone === "yellow") {
    return {
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
      bg: "bg-amber-50/50",
      solid: "bg-amber-500 text-white",
    }
  }
  return {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/50",
    solid: "bg-emerald-600 text-white",
  }
}

export function formatRelativeTime(dateString: string) {
  return "Hozirgina"
}
