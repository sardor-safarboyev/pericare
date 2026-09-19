"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { evaluateVitals, uid } from "./clinical"
import {
  seedDashboard,
  seedMlMetrics,
  seedPatients,
  seedReferrals,
  seedVitals,
} from "./mock-data"
import type {
  ClinicalRole,
  DashboardStats,
  FacilityType,
  MlMetrics,
  OcrExtraction,
  Patient,
  Referral,
  ReferralActionType,
  ReferralStatus,
  SyncState,
  TriageResult,
  User,
  VitalRecord,
  Vitals,
} from "./types"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface RegisterInput {
  fullName: string
  email: string
  password: string
  role: ClinicalRole
  facility: FacilityType
}

interface StoreValue {
  user: User | null
  patients: Patient[]
  referrals: Referral[]
  triageHistory: TriageResult[]
  dashboard: DashboardStats
  mlMetrics: MlMetrics
  syncState: SyncState
  pendingSync: number
  // auth  -> /api/v1/auth/*
  login: (email: string, role: ClinicalRole, facility: FacilityType) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  // patients -> /api/v1/patients
  createPatient: (
    input: Omit<Patient, "id" | "riskZone" | "syndrome" | "lastVisit" | "synced">,
  ) => Promise<Patient>
  getVitals: (patientId: string) => VitalRecord[]
  // triage -> /api/v1/triage/*
  extractOcr: () => Promise<OcrExtraction>
  evaluateTriage: (vitals: Vitals, patientId?: string) => Promise<TriageResult>
  // referrals -> /api/v1/referrals/*
  createReferral: (result: TriageResult) => Referral
  addReferralAction: (
    referralId: string,
    type: ReferralActionType,
    note: string,
  ) => Promise<void>
  advanceReferral: (referralId: string, status: ReferralStatus) => void
  // sync -> /api/v1/sync/batch
  toggleConnectivity: () => void
  syncBatch: () => Promise<number>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [patients, setPatients] = useState<Patient[]>(seedPatients)
  const [vitals, setVitals] = useState<Record<string, VitalRecord[]>>(seedVitals)
  const [referrals, setReferrals] = useState<Referral[]>(seedReferrals)
  const [triageHistory, setTriageHistory] = useState<TriageResult[]>([])
  const [syncState, setSyncState] = useState<SyncState>("online")

  const pendingSync = useMemo(
    () => patients.filter((p) => !p.synced).length,
    [patients],
  )

  const login = useCallback(
    async (email: string, role: ClinicalRole, facility: FacilityType) => {
      await delay(500)
      const newUser: User = {
        id: uid("usr"),
        fullName: email.split("@")[0].replace(/[._]/g, " ") || "Clinician",
        email,
        role,
        facility,
      }
      setUser(newUser)
      return newUser
    },
    [],
  )

  const register = useCallback(async (input: RegisterInput) => {
    await delay(600)
    const newUser: User = {
      id: uid("usr"),
      fullName: input.fullName,
      email: input.email,
      role: input.role,
      facility: input.facility,
    }
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const createPatient = useCallback<StoreValue["createPatient"]>(async (input) => {
    await delay(400)
    const online = syncState === "online"
    const patient: Patient = {
      ...input,
      id: uid("pat"),
      riskZone: input.previousPreeclampsia ? "yellow" : "green",
      syndrome: "none",
      lastVisit: new Date().toISOString(),
      synced: online,
    }
    setPatients((prev) => [patient, ...prev])
    setVitals((prev) => ({ ...prev, [patient.id]: [] }))
    return patient
  }, [syncState])

  const getVitals = useCallback(
    (patientId: string) => vitals[patientId] ?? [],
    [vitals],
  )

  const extractOcr = useCallback<StoreValue["extractOcr"]>(async () => {
    await delay(1800)
    return {
      systolic: 158 + Math.round(Math.random() * 10),
      diastolic: 104 + Math.round(Math.random() * 8),
      heartRate: 92 + Math.round(Math.random() * 10),
      spo2: 94 + Math.round(Math.random() * 3),
      temperature: Number((36.8 + Math.random() * 0.9).toFixed(1)),
      confidence: Number((0.9 + Math.random() * 0.08).toFixed(3)),
    }
  }, [])

  const evaluateTriage = useCallback<StoreValue["evaluateTriage"]>(
    async (v, patientId) => {
      await delay(700)
      const patient = patientId ? patients.find((p) => p.id === patientId) : undefined
      const base = evaluateVitals(v, patient?.previousPreeclampsia)
      const result: TriageResult = {
        ...base,
        id: uid("trg"),
        patientId,
        evaluatedAt: new Date().toISOString(),
      }
      setTriageHistory((prev) => [result, ...prev].slice(0, 25))
      if (patientId) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === patientId
              ? { ...p, riskZone: result.riskZone, syndrome: result.syndrome, lastVisit: result.evaluatedAt }
              : p,
          ),
        )
        setVitals((prev) => {
          const existing = prev[patientId] ?? []
          const record: VitalRecord = {
            ...v,
            id: uid("vit"),
            patientId,
            recordedAt: result.evaluatedAt,
            visitLabel: `Visit ${existing.length + 1}`,
          }
          return { ...prev, [patientId]: [...existing, record] }
        })
      }
      return result
    },
    [patients],
  )

  const createReferral = useCallback<StoreValue["createReferral"]>((result) => {
    const patient = result.patientId
      ? patients.find((p) => p.id === result.patientId)
      : undefined
    const referral: Referral = {
      id: uid("ref"),
      patientId: result.patientId ?? "unassigned",
      patientName: patient?.fullName ?? "Unassigned Patient",
      syndrome: result.syndrome,
      riskZone: result.riskZone,
      status: "pending",
      createdAt: new Date().toISOString(),
      slaMinutes: 0,
      actions: [],
    }
    setReferrals((prev) => [referral, ...prev])
    return referral
  }, [patients])

  const addReferralAction = useCallback<StoreValue["addReferralAction"]>(
    async (referralId, type, note) => {
      await delay(300)
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === referralId
            ? {
                ...r,
                actions: [
                  ...r.actions,
                  { id: uid("act"), type, note, timestamp: new Date().toISOString() },
                ],
              }
            : r,
        ),
      )
    },
    [],
  )

  const advanceReferral = useCallback<StoreValue["advanceReferral"]>((referralId, status) => {
    setReferrals((prev) => prev.map((r) => (r.id === referralId ? { ...r, status } : r)))
  }, [])

  const toggleConnectivity = useCallback(() => {
    setSyncState((prev) => (prev === "online" ? "offline" : "online"))
  }, [])

  const syncBatch = useCallback<StoreValue["syncBatch"]>(async () => {
    await delay(1400)
    const count = patients.filter((p) => !p.synced).length
    setPatients((prev) => prev.map((p) => ({ ...p, synced: true })))
    setSyncState("online")
    return count
  }, [patients])

  const value: StoreValue = {
    user,
    patients,
    referrals,
    triageHistory,
    dashboard: seedDashboard,
    mlMetrics: seedMlMetrics,
    syncState,
    pendingSync,
    login,
    register,
    logout,
    createPatient,
    getVitals,
    extractOcr,
    evaluateTriage,
    createReferral,
    addReferralAction,
    advanceReferral,
    toggleConnectivity,
    syncBatch,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
