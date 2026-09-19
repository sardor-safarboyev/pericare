import React, { useState } from "react"
import {
  Search,
  Plus,
  Flag,
  Activity,
  Calendar,
  User,
  Phone,
  MapPin,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Stethoscope,
  Pill
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { NewVisitModal } from "@/components/new-visit-modal"

export function PatientsView({ onOpenRegister }: { onOpenRegister?: () => void }) {
  const { patients, fetchPatientVitals } = useStore()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "red" | "yellow" | "green">("all")
  const [selectedId, setSelectedId] = useState<string>(patients[0]?.id || "")
  const [modalOpen, setModalOpen] = useState(false)

  React.useEffect(() => {
    if (selectedId && fetchPatientVitals) {
      fetchPatientVitals(selectedId)
    }
  }, [selectedId])

  const filtered = patients.filter((p) => {
    const match = p.fullName.toLowerCase().includes(search.toLowerCase())
    if (filter === "all") return match
    return match && p.riskZone === filter
  })

  const selectedPatient = patients.find((p) => p.id === selectedId) || filtered[0]

  return (
    <div className="space-y-4">
      {/* Qidiruv va Filtr Paneli */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Qidiruv: Bemor ismi yoki ID raqami..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-200 text-xs font-normal focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              filter === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Barchasi ({patients.length})
          </button>
          <button
            onClick={() => setFilter("red")}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              filter === "red" ? "bg-rose-600 text-white" : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <Flag className="w-3.5 h-3.5 fill-rose-600 text-rose-600" /> Kritik
          </button>
          <button
            onClick={() => setFilter("yellow")}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              filter === "yellow" ? "bg-amber-500 text-white" : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <Flag className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Nazorat
          </button>
          <button
            onClick={() => setFilter("green")}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              filter === "green" ? "bg-emerald-600 text-white" : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <Flag className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Me'yor
          </button>
        </div>
      </div>

      {/* Master-Detail: Chapda Ro'yxat, O'ngda To'liq Anamnez & Tarix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Chap tomon: CommCare Bemorlar Ro'yxati (5 ustun) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-[#1E3A8A] text-white text-xs font-semibold grid grid-cols-12 px-4 py-2.5">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">EDD</div>
            <div className="col-span-3">Next Visit</div>
            <div className="col-span-1 text-center">R</div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
            {filtered.map((p) => {
              const isSelected = selectedPatient?.id === p.id
              const isRed = p.riskZone === "red"
              const isYellow = p.riskZone === "yellow"

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`grid grid-cols-12 px-4 py-3 items-center text-xs cursor-pointer transition ${
                    isSelected ? "bg-blue-50/90 border-l-4 border-[#1E3A8A]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="col-span-5 pr-2">
                    <span className="font-semibold text-slate-900 block text-[13px]">{p.fullName}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {p.age} yosh · {p.gestationalWeeks}w
                    </span>
                  </div>

                  <div className="col-span-3 text-slate-600 font-normal">{p.edd}</div>

                  <div className="col-span-3">
                    {isRed ? (
                      <span className="text-rose-600 font-semibold block">Bugun (Zudlik)</span>
                    ) : (
                      <span className="text-slate-600 font-normal block">{p.nextVisit}</span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <Flag
                      className={`w-4 h-4 ${
                        isRed
                          ? "fill-rose-600 text-rose-600 animate-pulse"
                          : isYellow
                          ? "fill-amber-500 text-amber-500"
                          : "fill-emerald-600 text-emerald-600"
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* O'ng tomon: Bemorning To'liq Profili, To'liq Ko'riklar Tarixi va Tahlillari (7 ustun) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedPatient ? (
            <div className="space-y-4">
              {/* 1. Case Profile Karta */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {selectedPatient.fullName}
                      </h3>
                      <span className="text-xs text-slate-500">({selectedPatient.age} yosh)</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {selectedPatient.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {selectedPatient.district}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      selectedPatient.riskZone === "red"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : selectedPatient.riskZone === "yellow"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {selectedPatient.riskZone === "red" ? "Kritik Xavf" : selectedPatient.riskZone === "yellow" ? "Nazorat" : "Me'yor"}
                  </span>
                </div>

                {/* Ko'rsatkichlar paneli */}
                <div className="grid grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[11px] block">Homila Muddati</span>
                    <strong className="text-slate-800 text-sm block mt-0.5">{selectedPatient.gestationalWeeks} hafta</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[11px] block">Tug'ruq Muddati</span>
                    <strong className="text-slate-800 text-sm block mt-0.5">{selectedPatient.edd}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[11px] block">Anamnez (G/P)</span>
                    <strong className="text-slate-800 text-sm block mt-0.5">G{selectedPatient.gravidity} P{selectedPatient.parity}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[11px] block">Qon Guruhi</span>
                    <strong className="text-slate-800 text-sm block mt-0.5">{selectedPatient.bloodGroup}</strong>
                  </div>
                </div>

                {/* Anamnestik ogohlantirishlar */}
                <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                  {selectedPatient.previousPreeclampsia && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                      Avvalgi homiladorlikda og'ir preeklampsiya bo'lgan
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Dispanser: {selectedPatient.facility}
                  </span>
                </div>
              </div>

              {/* 2. Bemorning To'liq Ko'riklar Tarixi (Longitudinal History) */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-[#1E3A8A]" />
                    <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
                      To'liq Ko'riklar va Vitallar Dinamikasi ({selectedPatient.vitalsHistory.length} ta tashrif)
                    </h4>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Tashrif</th>
                        <th className="py-2.5 px-3">Sana / Muddat</th>
                        <th className="py-2.5 px-3">Qon Bosimi</th>
                        <th className="py-2.5 px-3">Puls</th>
                        <th className="py-2.5 px-3">Siydik Oqsili</th>
                        <th className="py-2.5 px-3">Xavf</th>
                        <th className="py-2.5 px-3">Qaydlar / Dori Choralari</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedPatient.vitalsHistory.map((enc) => {
                        const isHigh = enc.systolic >= 140 || enc.diastolic >= 90
                        return (
                          <tr key={enc.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{enc.visitLabel}</td>
                            <td className="py-2.5 px-3 text-slate-500">{enc.date} ({enc.gestationalWeek}w)</td>
                            <td className={`py-2.5 px-3 font-bold ${isHigh ? "text-rose-600" : "text-slate-800"}`}>
                              {enc.systolic}/{enc.diastolic} mmHg
                            </td>
                            <td className="py-2.5 px-3">{enc.heartRate} bpm</td>
                            <td className="py-2.5 px-3 font-medium">{enc.proteinuria}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                                enc.riskZone === "red" ? "bg-rose-600" : enc.riskZone === "yellow" ? "bg-amber-500" : "bg-emerald-600"
                              }`} />
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate font-normal">
                              {enc.notes || "—"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. AI Diagnostik Xulosasi va Yangi Ko'rik Kiritish Boshqaruvi */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-blue-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> AI Dinamika & MEOWS Tahlili:
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedPatient.riskZone === "red"
                      ? "Bosim 165/108 mmHg ga ko'tarilgan, proteinuriya 2+. Shok indeksi: 0.64. Zudlik bilan MgSO4 va viloyat markaziga eskalatsiya talab qilinadi."
                      : "Homiladorlik rivojlanishi barqaror, rejali ko'rik davom ettirilsin."}
                  </p>
                </div>

                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-semibold h-9 px-4 rounded shadow-2xs shrink-0 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Yangi Ko'rik Kiritish
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Bemor tanlanmagan
            </div>
          )}
        </div>
      </div>

      <NewVisitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedPatientId={selectedPatient?.id}
      />
    </div>
  )
}
