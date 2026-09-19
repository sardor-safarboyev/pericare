import React, { useState } from "react"
import {
  Ambulance,
  BedDouble,
  Clock,
  Phone,
  Pill,
  Send,
  ShieldAlert,
  Syringe,
  Activity,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { useStore } from "@/lib/store"
import {
  REFERRAL_ACTION_LABELS,
  REFERRAL_STATUS_LABELS,
  FACILITY_LABELS,
  riskClasses
} from "@/lib/clinical"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/risk-badge"
import { cn } from "@/lib/utils"
import type { ReferralActionType, ReferralStatus } from "@/lib/types"

const ACTION_ICONS: Record<ReferralActionType, any> = {
  magnesium_sulfate: Syringe,
  anti_hypertensive: Pill,
  icu_bed_requested: BedDouble,
  ambulance_dispatched: Ambulance,
  stabilization_given: Activity,
  call: Phone,
  note: FileText,
}

const STATUS_FLOW: ReferralStatus[] = ["pending", "in_transit", "admitted"]

export function ReferralsView() {
  const { referrals, advanceReferral, addReferralAction } = useStore()
  const [selectedId, setSelectedId] = useState<string>(referrals[0]?.id ?? "")
  const [actionType, setActionType] = useState<ReferralActionType>("magnesium_sulfate")
  const [actionNote, setActionNote] = useState("")

  const activeReferral = referrals.find((r) => r.id === selectedId) ?? referrals[0]

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReferral) return
    addReferralAction(activeReferral.id, actionType, actionNote || REFERRAL_ACTION_LABELS[actionType])
    setActionNote("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Eskalatsiyalar va Shoshilinch Yo'llanmalar (SLA)
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Kritik (Qizil) xavf guruhidagi homiladorlarni viloyat perinatal markaziga uzatish protokoli
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Chap ro'yxat */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-[#2B4380] text-white text-xs font-medium px-4 py-2.5">
            Faol Yo'llanmalar ({referrals.length})
          </div>

          <div className="divide-y divide-slate-100">
            {referrals.map((ref) => {
              const isSelected = ref.id === activeReferral?.id
              return (
                <div
                  key={ref.id}
                  onClick={() => setSelectedId(ref.id)}
                  className={`p-3.5 cursor-pointer text-xs transition ${
                    isSelected ? "bg-blue-50/80 border-l-4 border-[#2B4380]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-[13px]">{ref.patientName}</span>
                    <RiskBadge zone={ref.riskZone} className="text-[10px] px-2 py-0.5" />
                  </div>
                  <div className="text-slate-500 font-normal">
                    {FACILITY_LABELS[ref.sourceFacility]} → {FACILITY_LABELS[ref.destinationFacility]}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> SLA: {ref.slaMinutes ?? 19} daqiqa
                    </span>
                    <span className="font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {REFERRAL_STATUS_LABELS[ref.status]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* O'ng tomon: Yo'llanma boshqaruvi va Protokol amallari */}
        <div className="lg:col-span-7 space-y-4">
          {activeReferral ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">{activeReferral.patientName}</h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Yo'llanma ID: {activeReferral.id} · Shok Indeksi: {activeReferral.shockIndex}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                    Status: {REFERRAL_STATUS_LABELS[activeReferral.status]}
                  </span>
                </div>

                {/* Bosqichlar (Flow) */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  {STATUS_FLOW.map((st, idx) => {
                    const isDone = STATUS_FLOW.indexOf(activeReferral.status) >= idx
                    return (
                      <button
                        key={st}
                        onClick={() => advanceReferral(activeReferral.id, st)}
                        className={`p-2 rounded border text-center font-medium transition ${
                          isDone
                            ? "bg-[#2B4380] text-white border-[#2B4380]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {REFERRAL_STATUS_LABELS[st]}
                      </button>
                    )
                  })}
                </div>

                {/* Amallar tarixi */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-semibold text-slate-800 block">Protokol Amallari Tarixi:</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {activeReferral.actions.map((act) => {
                      const Icon = ACTION_ICONS[act.type ?? act.actionType ?? "note"] ?? FileText
                      return (
                        <div key={act.id} className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#2B4380]" />
                            <span className="font-medium text-slate-800">{act.note}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{act.actorName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tezkor Amal Qo'shish */}
                <form onSubmit={handleAddAction} className="pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-xs font-semibold text-slate-800 block">Yangi Klinik Amal Yozish:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value as ReferralActionType)}
                      className="h-9 px-2.5 rounded border border-slate-300 text-xs font-medium bg-white"
                    >
                      <option value="magnesium_sulfate">Magniy Sulfat (MgSO4)</option>
                      <option value="anti_hypertensive">Antigipertenziv dori</option>
                      <option value="ambulance_dispatched">Reanimobil chaqirildi</option>
                      <option value="icu_bed_requested">ICU o'rni band qilindi</option>
                      <option value="call">Shifokorga telefon</option>
                      <option value="note">Klinik qayd</option>
                    </select>

                    <input
                      type="text"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="Qo'shimcha izoh..."
                      className="h-9 px-3 rounded border border-slate-300 text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#2B4380] hover:bg-[#1E3A8A] text-white text-xs font-medium h-9 rounded gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Protokol Amalini Saqlash
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Yo'llanma tanlanmagan
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
