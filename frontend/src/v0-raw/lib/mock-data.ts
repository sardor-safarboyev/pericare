import type {
  DashboardStats,
  MlMetrics,
  Patient,
  Referral,
  VitalRecord,
} from "./types"

export const seedPatients: Patient[] = [
  {
    id: "pat_amina",
    fullName: "Amina Yusuf",
    age: 29,
    gestationalWeeks: 34,
    gravidity: 3,
    parity: 1,
    previousPreeclampsia: true,
    riskZone: "red",
    syndrome: "severe_preeclampsia",
    lastVisit: new Date(Date.now() - 25 * 60000).toISOString(),
    synced: true,
  },
  {
    id: "pat_grace",
    fullName: "Grace Okoro",
    age: 24,
    gestationalWeeks: 28,
    gravidity: 1,
    parity: 0,
    previousPreeclampsia: false,
    riskZone: "yellow",
    syndrome: "gestational_hypertension",
    lastVisit: new Date(Date.now() - 3 * 3600000).toISOString(),
    synced: true,
  },
  {
    id: "pat_fatima",
    fullName: "Fatima Bello",
    age: 31,
    gestationalWeeks: 39,
    gravidity: 2,
    parity: 1,
    previousPreeclampsia: false,
    riskZone: "green",
    syndrome: "none",
    lastVisit: new Date(Date.now() - 6 * 3600000).toISOString(),
    synced: true,
  },
  {
    id: "pat_ruth",
    fullName: "Ruth Adeyemi",
    age: 27,
    gestationalWeeks: 31,
    gravidity: 2,
    parity: 0,
    previousPreeclampsia: true,
    riskZone: "yellow",
    syndrome: "preeclampsia",
    lastVisit: new Date(Date.now() - 9 * 3600000).toISOString(),
    synced: false,
  },
  {
    id: "pat_zainab",
    fullName: "Zainab Musa",
    age: 22,
    gestationalWeeks: 26,
    gravidity: 1,
    parity: 0,
    previousPreeclampsia: false,
    riskZone: "green",
    syndrome: "none",
    lastVisit: new Date(Date.now() - 26 * 3600000).toISOString(),
    synced: true,
  },
  {
    id: "pat_esther",
    fullName: "Esther Nwosu",
    age: 34,
    gestationalWeeks: 37,
    gravidity: 4,
    parity: 3,
    previousPreeclampsia: false,
    riskZone: "red",
    syndrome: "postpartum_hemorrhage",
    lastVisit: new Date(Date.now() - 40 * 60000).toISOString(),
    synced: false,
  },
]

function visits(patientId: string, series: [number, number, number, number][]): VitalRecord[] {
  return series.map(([sys, dia, hr, weeksAgo], i) => ({
    id: `${patientId}_v${i}`,
    patientId,
    recordedAt: new Date(Date.now() - weeksAgo * 7 * 24 * 3600000).toISOString(),
    visitLabel: `Visit ${i + 1}`,
    systolic: sys,
    diastolic: dia,
    heartRate: hr,
    spo2: 97 - i,
    temperature: 36.8,
    proteinuria: i > 2 ? "2+" : "trace",
  }))
}

export const seedVitals: Record<string, VitalRecord[]> = {
  pat_amina: visits("pat_amina", [
    [128, 82, 84, 8],
    [138, 88, 88, 6],
    [148, 96, 92, 4],
    [164, 108, 98, 2],
    [172, 114, 104, 0],
  ]),
  pat_grace: visits("pat_grace", [
    [118, 74, 78, 6],
    [126, 80, 80, 4],
    [134, 86, 84, 2],
    [142, 90, 86, 0],
  ]),
  pat_fatima: visits("pat_fatima", [
    [112, 70, 72, 6],
    [116, 72, 74, 4],
    [118, 74, 76, 2],
    [120, 76, 78, 0],
  ]),
  pat_ruth: visits("pat_ruth", [
    [122, 78, 80, 6],
    [132, 84, 84, 4],
    [140, 92, 88, 2],
    [146, 94, 90, 0],
  ]),
  pat_zainab: visits("pat_zainab", [
    [110, 68, 70, 6],
    [112, 70, 72, 4],
    [114, 70, 74, 2],
    [116, 72, 74, 0],
  ]),
  pat_esther: visits("pat_esther", [
    [120, 76, 82, 6],
    [124, 78, 90, 4],
    [118, 74, 104, 2],
    [104, 66, 118, 0],
  ]),
}

export const seedReferrals: Referral[] = [
  {
    id: "ref_amina",
    patientId: "pat_amina",
    patientName: "Amina Yusuf",
    syndrome: "severe_preeclampsia",
    riskZone: "red",
    status: "in_transit",
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    slaMinutes: 22,
    actions: [
      {
        id: "act_1",
        type: "magnesium_sulfate",
        note: "4g IV loading dose administered",
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: "act_2",
        type: "ambulance_dispatched",
        note: "Unit A-12 en route to Tertiary Perinatal Center",
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ref_esther",
    patientId: "pat_esther",
    patientName: "Esther Nwosu",
    syndrome: "postpartum_hemorrhage",
    riskZone: "red",
    status: "pending",
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    slaMinutes: 8,
    actions: [],
  },
]

export const seedDashboard: DashboardStats = {
  totalScreened: 1284,
  redCriticals: 37,
  avgReferralSlaMinutes: 18,
  ocrAccuracy: 0.962,
  riskDistribution: [
    { zone: "green", count: 842 },
    { zone: "yellow", count: 405 },
    { zone: "red", count: 37 },
  ],
  dailyVolume: Array.from({ length: 14 }, (_, i) => {
    const date = new Date(Date.now() - (13 - i) * 24 * 3600000)
    const triage = 60 + Math.round(Math.sin(i / 2) * 18) + i
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      triage,
      admissions: Math.round(triage * 0.22) + (i % 3),
    }
  }),
  topSyndromes: [
    { syndrome: "gestational_hypertension", count: 214 },
    { syndrome: "preeclampsia", count: 158 },
    { syndrome: "severe_preeclampsia", count: 74 },
    { syndrome: "postpartum_hemorrhage", count: 41 },
    { syndrome: "eclampsia", count: 19 },
    { syndrome: "sepsis", count: 12 },
  ],
}

export const seedMlMetrics: MlMetrics = {
  aucRoc: 0.947,
  precision: 0.912,
  recall: 0.889,
  f1: 0.9,
  inferenceLatencyMs: 84,
  model: "Stacking Classifier (XGB + RF + LR meta)",
}
