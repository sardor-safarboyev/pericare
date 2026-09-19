import React, { useState, useRef } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Info,
  Send,
  ShieldAlert,
  Sparkles,
  Upload
} from "lucide-react"
import { useStore } from "@/lib/store"
import type { TriageResult, Vitals } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RiskBadge } from "@/components/risk-badge"
import { cn } from "@/lib/utils"
import type { ViewKey } from "@/components/app-shell"

const DEFAULT_VITALS: Vitals = {
  systolic: 120,
  diastolic: 80,
  heartRate: 78,
  spo2: 98,
  temperature: 36.6,
  proteinuria: "negative",
}

export function TriageView({
  initialPatientId,
  onNavigate,
}: {
  initialPatientId?: string
  onNavigate: (v: ViewKey) => void
}) {
  const { patients, extractOcr, evaluateTriage } = useStore()
  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id ?? ""))
  const [vitals, setVitals] = useState<Vitals>(DEFAULT_VITALS)
  const [evaluating, setEvaluating] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null)
  const [result, setResult] = useState<TriageResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedPatient = patients.find((p) => p.id === patientId) || patients[0]

  const isBpHigh = vitals.systolic >= 140 || vitals.diastolic >= 90
  const isBpCritical = vitals.systolic >= 160 || vitals.diastolic >= 110

  const handleInputChange = (field: keyof Vitals, val: any) => {
    setVitals((prev) => ({ ...prev, [field]: val }))
    setResult(null)
  }

  const setPreset = (sys: number, dia: number, hr: number, prot: any) => {
    setVitals({
      ...vitals,
      systolic: sys,
      diastolic: dia,
      heartRate: hr,
      proteinuria: prot,
    })
    setResult(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setOcrSuccess(null)
    try {
      const extracted = await extractOcr(file)
      setVitals((prev) => ({
        ...prev,
        systolic: extracted.systolic ?? prev.systolic,
        diastolic: extracted.diastolic ?? prev.diastolic,
        heartRate: extracted.heartRate ?? prev.heartRate,
      }))
      setOcrSuccess(`Aniqlik: ${Math.round((extracted.confidence || 0.95) * 100)}% (${extracted.systolic}/${extracted.diastolic} mmHg)`)
    } finally {
      setScanning(false)
    }
  }

  const handleEvaluate = async () => {
    setEvaluating(true)
    try {
      const res = await evaluateTriage(vitals, patientId)
      setResult(res)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> PeriSafe AI Triage
            </span>
            <span className="text-xs text-slate-500 font-medium">MEOWS + Stacking Ensemble</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Perinatal Xavf Baholash & Triaj</h1>
          <p className="text-sm text-slate-600">
            Vital ko'rsatkichlarni kiriting yoki tonometr monitori suratini yuklang.
          </p>
        </div>

        {/* Tezkor Klinik Shablonlar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Shablonlar:</span>
          <button
            onClick={() => setPreset(118, 76, 74, "negative")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Normal (118/76)
          </button>
          <button
            onClick={() => setPreset(145, 92, 88, "trace")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
          >
            O'rta xavf (145/92)
          </button>
          <button
            onClick={() => setPreset(165, 105, 102, "2+")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition"
          >
            Kritik (165/105)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chap ustun: Bemor va Vital Inputlar (7 ustun) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bemor tanlash */}
          <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/60 pb-3 pt-4 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" /> Bemor Ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Homilador Ayol</Label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.age} yosh, {p.gestationalWeeks} hafta)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Homila muddati:</span>
                    <strong className="text-slate-900 font-semibold">{selectedPatient?.gestationalWeeks || 34} hafta</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Avvalgi anamnez:</span>
                    <span className="font-semibold text-amber-700">Preeklampsiya xavfi mavjud</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hudud / Muassasa:</span>
                    <strong className="text-slate-900">Urganch TTB Tug'ruqxona</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OCR Tezkor Suratdan O'qish */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-600/30 bg-emerald-50/40 p-4 transition hover:bg-emerald-50/70">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tonometr Displeyi yoki Qog'oz Blank (OCR)</h4>
                  <p className="text-xs text-slate-600">
                    Suratni yuklang — AI 1 soniyada bosim va pulsni avtomatik aniqlaydi.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm gap-2"
              >
                <Upload className="w-4 h-4" />
                {scanning ? "Skanerlanmoqda..." : "Surat Yuklash"}
              </Button>
            </div>
            {ocrSuccess && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white/80 py-1.5 px-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {ocrSuccess}
              </div>
            )}
          </div>

          {/* Vital Ko'rsatkichlar — Qulay Raqamli Inputlar */}
          <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3 pt-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" /> Hayotiy Ko'rsatkichlar (Vital Signs)
              </CardTitle>
              <span className="text-xs text-slate-500">CommCare Direct Numeric Input</span>
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
              {/* Arterial Bosim Blok */}
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-200",
                isBpCritical
                  ? "bg-rose-50/50 border-rose-300 ring-2 ring-rose-200"
                  : isBpHigh
                  ? "bg-amber-50/50 border-amber-300"
                  : "bg-slate-50/70 border-slate-200"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className={cn("w-4 h-4", isBpHigh ? "text-rose-600 animate-pulse" : "text-emerald-700")} />
                    <Label className="text-sm font-bold text-slate-900">Arterial Qon Bosimi (BP)</Label>
                  </div>
                  {isBpHigh && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      {isBpCritical ? "Kritik Gipertenziya (≥160/110)" : "Yuqori Bosim (≥140/90)"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">Sistolik (mmHg)</span>
                    <input
                      type="number"
                      value={vitals.systolic}
                      onChange={(e) => handleInputChange("systolic", Number(e.target.value))}
                      className="w-full text-2xl font-extrabold text-slate-900 h-13 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">Diastolik (mmHg)</span>
                    <input
                      type="number"
                      value={vitals.diastolic}
                      onChange={(e) => handleInputChange("diastolic", Number(e.target.value))}
                      className="w-full text-2xl font-extrabold text-slate-900 h-13 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Puls, Harorat, Proteinuriya */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Yurak Urisi (BPM)</Label>
                  <input
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) => handleInputChange("heartRate", Number(e.target.value))}
                    className="w-full text-xl font-bold text-slate-900 h-11 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                  />
                  <span className="text-[11px] text-slate-500 text-center block mt-1">Me'yor: 60 - 100</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tana Harorati (°C)</Label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => handleInputChange("temperature", Number(e.target.value))}
                    className="w-full text-xl font-bold text-slate-900 h-11 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                  />
                  <span className="text-[11px] text-slate-500 text-center block mt-1">Sepsis: &gt; 38.0</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Siydikdagi Oqsil</Label>
                  <select
                    value={vitals.proteinuria}
                    onChange={(e) => handleInputChange("proteinuria", e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 h-11 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                  >
                    <option value="negative">Manfiy (-)</option>
                    <option value="trace">Izlari (Trace)</option>
                    <option value="1+">1+ (0.3 g/L)</option>
                    <option value="2+">2+ (1.0 g/L)</option>
                    <option value="3+">3+ (&gt;3.0 g/L)</option>
                  </select>
                  <span className="text-[11px] text-rose-600 font-medium text-center block mt-1">Preeklampsiya: ≥ 1+</span>
                </div>
              </div>

              {/* Triage Boshlash Tugmasi */}
              <Button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="w-full h-13 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {evaluating ? (
                  "AI Tahlil qilmoqda..."
                ) : (
                  <>
                    <Activity className="w-5 h-5" /> Triage Xavfini Baholash
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* O'ng ustun: AI Tahlili va Qaror Paneli (5 ustun) — White Space bartaraf etildi */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Asosiy Natija Kartasi */}
              <div className={cn(
                "p-6 rounded-2xl border shadow-sm",
                result.riskZone === "red"
                  ? "bg-rose-50/80 border-rose-200"
                  : result.riskZone === "yellow"
                  ? "bg-amber-50/80 border-amber-200"
                  : "bg-emerald-50/80 border-emerald-200"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <RiskBadge zone={result.riskZone} className="text-sm px-3 py-1 font-bold" />
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white shadow-xs text-slate-700 border border-slate-200">
                    Ishonchlilik: {Math.round(result.probability * 100)}%
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 capitalize mb-1">
                  {result.syndrome.replace("_", " ")}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {result.riskZone === "red"
                    ? "Kritik holat aniqlandi. Zudlik bilan yuqori bosqich tibbiyot muassasasiga yo'naltirish talab etiladi."
                    : result.riskZone === "yellow"
                    ? "O'rta darajadagi xavf. Dinamik kuzatuv va takroriy nazorat zarur."
                    : "Homilador ayol holati qoniqarli. Rejali monitoring tavsiya etiladi."}
                </p>

                {/* Shok Indeksi va Tezlik Ko'rsatkichi */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                  <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 font-medium block">Shok Indeksi (HR/SBP)</span>
                    <span className="text-lg font-bold text-slate-900">{result.shockIndex}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Me'yor: &lt; 0.9</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 font-medium block">Protokol SLA</span>
                    <span className="text-lg font-bold text-rose-700">60 daqiqa</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Eskalatsiya muddati</span>
                  </div>
                </div>
              </div>

              {/* Explainable AI (SHAP Faktori) */}
              <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white">
                <CardHeader className="pb-3 pt-4 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" /> Nega bu xulosa berildi? (SHAP Ta'siri)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {result.shapFactors.map((factor, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{factor.feature}</span>
                        <span className="text-emerald-800">+{Math.round(factor.contribution * 100)}% ta'sir</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(factor.contribution * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tavsiya va Chora-tadbirlar */}
              <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white">
                <CardHeader className="pb-2 pt-4 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Klinik Tavsiya & Protokol
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-4">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
                    {result.recommendation}
                  </p>

                  {result.riskZone === "red" && (
                    <Button
                      onClick={() => onNavigate("referrals")}
                      className="w-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold h-11 rounded-xl shadow gap-2"
                    >
                      <Send className="w-4 h-4" /> Yo'llanmani Ochish & Eskalatsiya (SLA 60m)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Baholashdan oldingi bo'sh joyni CommCare Klinik Qo'llanmasi bilan to'ldiramiz */
            <div className="space-y-6">
              <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Baholash Kutilmoqda</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                    Vital ko'rsatkichlarni kiriting va <strong>Triage Xavfini Baholash</strong> tugmasini bosing.
                  </p>
                </div>
              </Card>

              {/* Klinik Ma'lumotnoma */}
              <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-white">
                <CardHeader className="pb-2 pt-4 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Klinik Xavf Chegaralari (MEOWS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-xs space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-100 font-medium">
                    <span>Qizil Zona (Favqulodda)</span>
                    <strong>BP ≥ 160/110 yoki Oqsil ≥ 2+</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-100 font-medium">
                    <span>Sariq Zona (Ogohlantirish)</span>
                    <strong>BP ≥ 140/90 yoki HR &gt; 100</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 font-medium">
                    <span>Yashil Zona (Me'yor)</span>
                    <strong>BP &lt; 140/90 va Oqsil (-)</strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
