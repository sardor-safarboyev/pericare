import React, { useState } from "react"
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Pill,
  FileCheck,
  Send,
  User
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function SpecialistView() {
  const { patients } = useStore()
  const criticalPatients = patients.filter((p) => p.riskZone === "red" || p.riskZone === "yellow")
  const [selectedId, setSelectedId] = useState<string>(criticalPatients[0]?.id || patients[0]?.id || "")
  const [prescription, setPrescription] = useState("MgSO4 4g IV yuklama dozasi, so'ng 1g/soat infuziya. Nifedipin 10mg.")
  const [doctorNote, setDoctorNote] = useState("")
  const [saved, setSaved] = useState(false)

  const activePatient = patients.find((p) => p.id === selectedId) || patients[0]

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-700" />
            Akusher-Ginekolog Mutaxassis Konsultatsiya Paneli
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kritik xavf (qizil va sariq zona) guruhidagi bemorlarning davolash rejasi va protokollari
          </p>
        </div>
        <div className="px-3 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {criticalPatients.length} ta holat ekspertiza talab qilmoqda
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Chap tomon: Kritik bemorlar */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-[#1E3A8A] text-white text-xs font-semibold px-4 py-2.5">
            Klinik Ko'rikka Muhtoj Homiladorlar
          </div>
          <div className="divide-y divide-slate-100">
            {criticalPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`p-3.5 cursor-pointer text-xs transition ${
                  p.id === activePatient?.id ? "bg-blue-50/90 border-l-4 border-[#1E3A8A]" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-[13px]">{p.fullName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.riskZone === "red" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {p.riskZone === "red" ? "Kritik Preeklampsiya" : "Nazorat"}
                  </span>
                </div>
                <div className="text-slate-500 font-normal">
                  {p.age} yosh · {p.gestationalWeeks} haftalik · Shok Indeksi: {p.shockIndex}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Oxirgi ko'rik: {p.lastVisit} (Doya qaydi mavjud)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O'ng tomon: Shifokor Ekspertizasi va Ko'rsatma */}
        <div className="lg:col-span-7 space-y-4">
          {activePatient && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activePatient.fullName}</h3>
                  <p className="text-xs text-slate-500 font-normal">
                    {activePatient.district} · {activePatient.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Homila / Anamnez:</span>
                  <strong className="text-slate-800 text-xs font-bold">
                    {activePatient.gestationalWeeks} hafta · G{activePatient.gravidity} P{activePatient.parity}
                  </strong>
                </div>
              </div>

              {/* Vitallar Tarixi Dinamikasi */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-700" /> Bemor Vitallari Dinamikasi:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {activePatient.vitalsHistory.map((v) => (
                    <div key={v.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">{v.visitLabel} ({v.date})</span>
                      <strong className={`block text-sm mt-0.5 ${
                        v.systolic >= 140 ? "text-rose-600 font-bold" : "text-slate-800"
                      }`}>
                        {v.systolic}/{v.diastolic} mmHg
                      </strong>
                      <span className="text-[11px] text-slate-500">Puls: {v.heartRate} · {v.proteinuria}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dori-darmon va Shifokor Ko'rsatmasi */}
              <form onSubmit={handleSaveDecision} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Pill className="w-3.5 h-3.5 text-blue-600" /> Shifokor Klinik Ko'rsatmasi & Tayinlov:
                  </label>
                  <textarea
                    rows={2}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    className="w-full p-2.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Klinik Xulosa va Eskalatsiya Tavsiyasi:
                  </label>
                  <input
                    type="text"
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    placeholder="Masalan: Viloyat perinatal markazi reanimatsiyasiga zudlik bilan qabul qilinsin"
                    className="w-full h-9 px-3 text-xs rounded border border-slate-300 focus:outline-none focus:border-blue-600 font-normal"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saved && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Shifokor ko'rsatmasi tizimga saqlandi!
                    </span>
                  )}
                  <Button
                    type="submit"
                    className="ml-auto bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold h-9 px-5 rounded gap-2 shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" /> Ko'rsatmani Tasdiqlash
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
