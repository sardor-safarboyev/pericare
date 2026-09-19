export type RiskZone = "green" | "yellow" | "red"

export type Syndrome =
  | "normal"
  | "gestational_hypertension"
  | "preeclampsia"
  | "severe_preeclampsia"
  | "eclampsia"
  | "hemorrhage_shock"

export type ClinicalRole = "midwife" | "nurse" | "specialist" | "district_specialist" | "regional_specialist" | "facility" | "auditor"
export type UserRole = ClinicalRole

export type FacilityType =
  | "district_hospital"
  | "perinatal_center"
  | "rural_point"
  | "district_maternity"

export type FacilityId = FacilityType

export type ReferralStatus =
  | "pending"
  | "initiated"
  | "accepted"
  | "in_transit"
  | "admitted"

export type ReferralActionType =
  | "magnesium_sulfate"
  | "anti_hypertensive"
  | "icu_bed_requested"
  | "ambulance_dispatched"
  | "stabilization_given"
  | "call"
  | "note"

export interface ReferralAction {
  id: string
  timestamp: string
  type: ReferralActionType
  actionType?: ReferralActionType
  actorName: string
  note: string
}

export interface Referral {
  id: string
  patientId: string
  patientName: string
  sourceFacility: FacilityId
  destinationFacility: FacilityId
  status: ReferralStatus
  createdAt: string
  updatedAt: string
  deadlineAt: string
  slaMinutes?: number
  riskZone: RiskZone
  syndrome: Syndrome
  shockIndex: number
  actions: ReferralAction[]
}

export interface EncounterVital {
  id: string
  visitLabel: string
  date: string
  gestationalWeek: number
  systolic: number
  diastolic: number
  heartRate: number
  temperature: number
  proteinuria: "negative" | "trace" | "1+" | "2+" | "3+"
  riskZone: RiskZone
  notes?: string
}

export interface PatientFullProfile {
  id: string
  fullName: string
  age: number
  gestationalWeeks: number
  edd: string
  nextVisit: string
  phone: string
  district: string
  facility: string
  gravidity: number
  parity: number
  bloodGroup: string
  previousPreeclampsia: boolean
  chronicHypertension: boolean
  diabetes: boolean
  riskZone: RiskZone
  syndrome: Syndrome
  shockIndex: number
  lastVisit: string
  synced: boolean
  vitalsHistory: EncounterVital[]
}

export type Patient = PatientFullProfile

export interface Vitals {
  systolic: number
  diastolic: number
  heartRate: number
  spo2?: number
  temperature?: number
  proteinuria: "negative" | "trace" | "1+" | "2+" | "3+"
}

export interface TriageResult {
  riskZone: RiskZone
  syndrome: Syndrome
  shockIndex: number
  probability: number
  recommendation: string
  shapFactors: { feature: string; contribution: number }[]
}

export interface DashboardStats {
  totalScreened: number
  redCriticals: number
  avgReferralSlaMinutes: number
  ocrAccuracy: number
  dailyVolume: { date: string; triage: number; admissions: number }[]
  riskDistribution: { zone: RiskZone; count: number }[]
  topSyndromes: { syndrome: Syndrome; count: number }[]
}

export interface MLMetrics {
  model: string
  aucRoc: number
  precision: number
  recall: number
  f1: number
  inferenceLatencyMs: number
}
