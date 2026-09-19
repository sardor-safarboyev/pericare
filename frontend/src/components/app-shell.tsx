import React, { useState } from "react"
import {
  Users,
  Send,
  Wifi,
  WifiOff,
  LogOut,
  User,
  UserPlus,
  Stethoscope,
  Hospital
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Language } from "@/lib/i18n"
import { UserProfileModal } from "@/components/user-profile-modal"

export type ViewKey = "followup" | "register" | "referrals" | "specialist" | "facility"

export function AppShell({
  view,
  onViewChange,
  children,
}: {
  view: ViewKey
  onViewChange: (v: ViewKey) => void
  children: React.ReactNode
}) {
  const { user, logout, syncState, toggleConnectivity, language, setLanguage } = useStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const role = user?.role || "midwife"

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans antialiased text-slate-900 pb-16 sm:pb-0">
      {/* 1. Yuqori App Bar */}
      <header className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Chap tomon: Logo va Foydalanuvchi */}
            <div
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-inner p-1">
                <img src="/logo.png" alt="PeriCare" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs sm:text-sm tracking-tight leading-none">PeriCare</span>
                <span className="text-[10px] text-blue-200 mt-0.5 truncate max-w-[140px] sm:max-w-xs font-normal">
                  {user?.fullName}
                </span>
              </div>
            </div>

            {/* O'ng tomon: Boshqaruv tugmalari */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Til tanlash */}
              <div className="flex bg-blue-950/60 p-0.5 rounded text-[10px] font-bold border border-blue-500/20">
                {(["uz", "ru", "en"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-1.5 py-0.5 rounded transition ${
                      language === lang ? "bg-white text-blue-950" : "text-blue-200 hover:text-white"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Onlayn / Oflayn */}
              <button
                onClick={toggleConnectivity}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition ${
                  syncState === "online"
                    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                    : "bg-slate-800/80 border-slate-600 text-slate-300"
                }`}
              >
                {syncState === "online" ? <Wifi className="w-3 h-3 text-emerald-300" /> : <WifiOff className="w-3 h-3 text-slate-400" />}
                <span className="hidden sm:inline">{syncState === "online" ? "Onlayn" : "Oflayn"}</span>
              </button>

              {/* Profil */}
              <button
                onClick={() => setProfileOpen(true)}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800/60"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Chiqish */}
              <button
                onClick={() => {
                  logout()
                  window.location.reload()
                }}
                className="p-1.5 text-blue-200 hover:text-rose-300 rounded-lg hover:bg-blue-800/60"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. CommCare Tablar (Gorizontal skroll bilan mobilga moslashtirilgan) */}
        <div className="bg-[#172554] border-t border-blue-800/50 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 flex min-w-max">
            {role === "midwife" && (
              <>
                <button
                  onClick={() => onViewChange("followup")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "followup"
                      ? "border-white text-white bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Follow Up
                </button>
                <button
                  onClick={() => onViewChange("register")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "register"
                      ? "border-emerald-400 text-emerald-300 bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register Pregnancy
                </button>
                <button
                  onClick={() => onViewChange("referrals")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "referrals"
                      ? "border-rose-400 text-rose-300 bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Referrals (SLA)
                </button>
              </>
            )}

            {role === "specialist" && (
              <>
                <button
                  onClick={() => onViewChange("specialist")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "specialist"
                      ? "border-white text-white bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Shifokor Ekspertizasi
                </button>
                <button
                  onClick={() => onViewChange("followup")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "followup"
                      ? "border-white text-white bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Barcha Bemorlar
                </button>
              </>
            )}

            {role === "facility" && (
              <>
                <button
                  onClick={() => onViewChange("facility")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "facility"
                      ? "border-white text-white bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <Hospital className="w-3.5 h-3.5" /> Qabul & ICU
                </button>
                <button
                  onClick={() => onViewChange("referrals")}
                  className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition shrink-0 ${
                    view === "referrals"
                      ? "border-white text-white bg-blue-900/50"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Yo'llanmalar (SLA)
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Asosiy Ishchi Maydon */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {children}
      </main>

      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
