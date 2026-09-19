import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { AuthScreen } from "@/components/auth-screen"
import { AppShell, type ViewKey } from "@/components/app-shell"
import { PatientsView } from "@/components/views/patients-view"
import { RegisterPregnancyView } from "@/components/views/register-pregnancy-view"
import { ReferralsView } from "@/components/views/referrals-view"
import { SpecialistView } from "@/components/views/specialist-view"
import { FacilityView } from "@/components/views/facility-view"

export function SentinelApp() {
  const { user, fetchMe } = useStore()
  const [view, setView] = useState<ViewKey>("followup")

  useEffect(() => {
    const token = localStorage.getItem("perisafe_token")
    if (token && !user) {
      fetchMe()
    }
  }, [])

  // Foydalanuvchi roliga qarab boshlang'ich panelni moslash
  useEffect(() => {
    const r = user?.role as string | undefined
    if (r === "specialist" || r === "district_specialist") {
      setView("specialist")
    } else if (r === "facility" || r === "regional_specialist") {
      setView("facility")
    } else {
      // nurse / midwife roli uchun asosiy homiladorlar monitoringi paneli
      setView("followup")
    }
  }, [user?.role])

  if (!user) return <AuthScreen />

  return (
    <AppShell view={view} onViewChange={setView}>
      {view === "followup" && <PatientsView onOpenRegister={() => setView("register")} />}
      {view === "register" && <RegisterPregnancyView onComplete={() => setView("followup")} />}
      {view === "referrals" && <ReferralsView />}
      {view === "specialist" && <SpecialistView />}
      {view === "facility" && <FacilityView />}
    </AppShell>
  )
}
