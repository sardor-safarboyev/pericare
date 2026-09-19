import React, { useState } from "react"
import {
  Hospital,
  BedDouble,
  Ambulance,
  Clock,
  Users,
  ShieldAlert,
  CheckCircle2,
  PhoneCall
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function FacilityView() {
  const { referrals, advanceReferral } = useStore()
  const [icuTotal] = useState(12)
  const [icuOccupied, setIcuOccupied] = useState(9)

  return (
    <div className="space-y-5">
      {/* Muassasa Bosh Paneli */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-blue-700" />
            Tibbiyot Muassasasi va Qabul Bo'limi Boshqaruvi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Urganch TTB Markaziy Tug'ruqxonasi · Reanimatsiya o'rinlari va Eskalatsiya oqimi
          </p>
        </div>
      </div>

      {/* KPI Kartalar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs flex items-center gap-1.5 font-normal">
            <BedDouble className="w-4 h-4 text-blue-600" /> Bo'sh Reanimatsiya (ICU) O'rni:
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <strong className="text-2xl font-bold text-slate-900">{icuTotal - icuOccupied} ta</strong>
            <span className="text-xs text-slate-500">/ {icuTotal} umumiy</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${(icuOccupied / icuTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs flex items-center gap-1.5 font-normal">
            <Ambulance className="w-4 h-4 text-rose-600" /> Yo'ldagi Reanimobillar:
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <strong className="text-2xl font-bold text-rose-600">2 ta</strong>
            <span className="text-xs text-rose-600 font-medium">Shoshilinch</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-normal">O'rtacha yetib kelish: 14 daqiqa</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs flex items-center gap-1.5 font-normal">
            <Clock className="w-4 h-4 text-amber-600" /> O'rtacha Referral SLA:
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <strong className="text-2xl font-bold text-slate-900">19 min</strong>
            <span className="text-xs text-emerald-600 font-medium">Normada (&lt;60m)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-normal">Protokol talabi to'liq bajarilmoqda</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs flex items-center gap-1.5 font-normal">
            <Users className="w-4 h-4 text-emerald-600" /> Navbatchi Brigada:
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <strong className="text-2xl font-bold text-slate-900">4 nafar</strong>
            <span className="text-xs text-emerald-600 font-medium">Faol</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-normal">2 akusher-ginekolog, 2 reanimatolog</p>
        </div>
      </div>

      {/* Yo'llanmalar va Qabul Stoli */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-[#1E3A8A] text-white text-xs font-semibold px-4 py-3 flex items-center justify-between">
          <span>Qabul Bo'limiga Yo'naltirilgan Homiladorlar (Real-time Oqim)</span>
          <span className="text-[11px] text-blue-200 font-normal">SLA Monitoringi</span>
        </div>

        <div className="divide-y divide-slate-100">
          {referrals.map((r) => (
            <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{r.patientName}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold uppercase text-[10px]">
                    Kritik (Eskalatsiya)
                  </span>
                </div>
                <p className="text-slate-500 font-normal">
                  Yo'naltiruvchi: QVP #4 → Qabul qiluvchi: Urganch TTB Markaziy Tug'ruqxona
                </p>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Shok Indeksi: <strong>{r.shockIndex}</strong></span>
                  <span>Amal: <strong>{r.actions[0]?.note || "MgSO4 berildi"}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => advanceReferral(r.id, "admitted")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-4 rounded shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Qabul Qilishni Tasdiqlash
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 text-xs font-medium h-8 px-3 rounded"
                >
                  <PhoneCall className="w-3.5 h-3.5 mr-1" /> Doya bilan aloqa
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
