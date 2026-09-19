import React, { useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  Clock,
  Plus,
  ScanLine,
  Users,
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import type { ViewKey } from "@/components/app-shell"

export function DashboardView({
  onNavigate,
  onTriage,
}: {
  onNavigate: (v: ViewKey) => void
  onTriage: (patientId?: string) => void
}) {
  const { dashboard, patients, language, fetchDashboardStats } = useStore()
  const t = translations[language]

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const criticals = patients.filter((p) => p.riskZone === "red")

  return (
    <div className="space-y-6">
      {/* Xush kelibsiz & Tezkor Harakat Paneli */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 mb-1">
            <ShieldCheck className="w-4 h-4" /> PeriCare
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t.greeting}, Nodira
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            <strong className="text-rose-600 font-bold">{dashboard.redCriticals} {t.criticalCases}</strong> {t.activeEmergency}.
          </p>
        </div>

        <Button
          onClick={() => onTriage()}
          className="h-11 px-5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-sm gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> {t.newTriage}
        </Button>
      </div>

      {/* 4 ta Asosiy Klinik Metrika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.totalScreened}</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{dashboard.totalScreened}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold">{t.criticalCases}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{dashboard.redCriticals}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold">{t.avgSla}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{dashboard.avgReferralSlaMinutes} m</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{t.ocrRate}</span>
            <ScanLine className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(dashboard.ocrAccuracy * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Nazoratdagi Bemorlar Ro'yxati (Toza, ortiqcha narsalarsiz) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {t.recentTriage}
          </h3>
          <button
            onClick={() => onNavigate("followup")}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            {t.all} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {patients.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                    p.riskZone === "red"
                      ? "bg-rose-100 text-rose-800"
                      : p.riskZone === "yellow"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {p.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{p.fullName}</h4>
                  <p className="text-xs text-slate-500">
                    {p.age} {t.age} · {p.gestationalWeeks} {t.weeks} ·{" "}
                    <span className="font-semibold text-slate-700 capitalize">
                      {p.syndrome?.replace("_", " ") || "Normal"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    p.riskZone === "red"
                      ? "bg-rose-100 text-rose-800"
                      : p.riskZone === "yellow"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {p.riskZone === "red" ? t.red : p.riskZone === "yellow" ? t.yellow : t.green}
                </span>
                <Button
                  size="sm"
                  onClick={() => onTriage(p.id)}
                  className="h-8 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-3"
                >
                  {t.triage}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
