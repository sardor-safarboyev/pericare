export type ClinicalRole = "doctor" | "midwife" | "triage_nurse"

export type FacilityType = "primary_care" | "district_maternity" | "tertiary_perinatal"

export type RiskZone = "green" | "yellow" | "red"

export type ProteinuriaLevel = "negative" | "trace" | "1+" | "2+" | "3+" | "4+"

export type ObstetricSyndrome =
  | "none"
  | "gestational_hypertension"
  | "preeclampsia"
  | "severe_preeclampsia"
  | "eclampsia"
  | "postpartum_hemorrhage"
  | "sepsis"

export type ReferralStatus = "pending" | "in_transit" | "admitted"

export type SyncState = "online" | "offline"

export interface User {
  id: string
  fullName: string
  email: string
  role: ClinicalRole
  facility: FacilityType
}

export interface Vitals {
  systolic: number
  diastolic: number
  heartRate: number
  spo2: number
  temperature: number
  proteinuria: ProteinuriaLevel
}

export interface VitalRecord extends Vitals {
  id: string
  patientId: string
  recordedAt: string
  visitLabel: string
}

export interface Patient {
  id: string
  fullName: string
  age: number
  gestationalWeeks: number
  gravidity: number
  parity: number
  previousPreeclampsia: boolean
  riskZone: RiskZone
  syndrome: ObstetricSyndrome
  lastVisit: string
  synced: boolean
}

export interface ShapFactor {
  feature: string
  contribution: number
}

export interface TriageResult {
  id: string
  patientId?: string
  riskZone: RiskZone
  syndrome: ObstetricSyndrome
  shockIndex: number
  probability: number
  recommendation: string
  shapFactors: ShapFactor[]
  vitals: Vitals
  evaluatedAt: string
}

export interface OcrExtraction {
  systolic: number
  diastolic: number
  heartRate: number
  spo2: number
  temperature: number
  confidence: number
}

export type ReferralActionType =
  | "magnesium_sulfate"
  | "anti_hypertensive"
  | "icu_bed_requested"
  | "ambulance_dispatched"

export interface ReferralAction {
  id: string
  type: ReferralActionType
  note: string
  timestamp: string
}

export interface Referral {
  id: string
  patientId: string
  patientName: string
  syndrome: ObstetricSyndrome
  riskZone: RiskZone
  status: ReferralStatus
  createdAt: string
  slaMinutes: number
  actions: ReferralAction[]
}

export interface DashboardStats {
  totalScreened: number
  redCriticals: number
  avgReferralSlaMinutes: number
  ocrAccuracy: number
  riskDistribution: { zone: RiskZone; count: number }[]
  dailyVolume: { date: string; admissions: number; triage: number }[]
  topSyndromes: { syndrome: ObstetricSyndrome; count: number }[]
}

export interface MlMetrics {
  aucRoc: number
  precision: number
  recall: number
  f1: number
  inferenceLatencyMs: number
  model: string
}
