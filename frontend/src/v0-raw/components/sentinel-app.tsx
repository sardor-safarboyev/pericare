"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { AuthScreen } from "@/components/auth-screen"
import { AppShell, type ViewKey } from "@/components/app-shell"
import { DashboardView } from "@/components/views/dashboard-view"
import { PatientsView } from "@/components/views/patients-view"
import { TriageView } from "@/components/views/triage-view"
import { ReferralsView } from "@/components/views/referrals-view"
import { ModelView } from "@/components/views/model-view"

export function SentinelApp() {
  const { user } = useStore()
  const [view, setView] = useState<ViewKey>("dashboard")
  const [triagePatientId, setTriagePatientId] = useState<string | undefined>()

  if (!user) return <AuthScreen />

  const openTriage = (patientId?: string) => {
    setTriagePatientId(patientId)
    setView("triage")
  }

  return (
    <AppShell view={view} onViewChange={setView}>
      {view === "dashboard" && <DashboardView onNavigate={setView} onTriage={openTriage} />}
      {view === "patients" && <PatientsView onTriage={openTriage} />}
      {view === "triage" && (
        <TriageView
          initialPatientId={triagePatientId}
          onOpenReferrals={() => setView("referrals")}
        />
      )}
      {view === "referrals" && <ReferralsView />}
      {view === "model" && <ModelView />}
    </AppShell>
  )
}
