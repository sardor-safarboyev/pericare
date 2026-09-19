import React, { useState, useRef } from "react"
import {
  Camera,
  Image as ImageIcon,
  Check,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function RegisterPregnancyView({ onComplete }: { onComplete: () => void }) {
  const { extractOcr, createPatient } = useStore()

  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("25")
  const [phone, setPhone] = useState("+998 90 456-78-90")
  const [district, setDistrict] = useState("Urganch tumani, G'oybu qishlog'i")
  const [dobKnown, setDobKnown] = useState<"yes" | "no">("no")
  const [gestationalWeeks, setGestationalWeeks] = useState("24")
  const [gravidity, setGravidity] = useState("2")
  const [parity, setParity] = useState("1")
  const [bloodGroup, setBloodGroup] = useState("A (II) Rh+")

  const [systolic, setSystolic] = useState("120")
  const [diastolic, setDiastolic] = useState("80")
  const [heartRate, setHeartRate] = useState("76")
  const [proteinuria, setProteinuria] = useState<"negative" | "trace" | "1+" | "2+" | "3+">("negative")
  const [processing, setProcessing] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    setStatusMsg("Kamera surati AI orqali tahlil qilinmoqda (/ocr-extract)...")
    try {
      const extracted = await extractOcr(file)
      if (extracted.systolic) setSystolic(String(extracted.systolic))
      if (extracted.diastolic) setDiastolic(String(extracted.diastolic))
      if (extracted.heartRate) setHeartRate(String(extracted.heartRate))
      setStatusMsg("Tonometr ko'rsatkichlari avtomatik o'qildi!")
    } finally {
      setProcessing(false)
    }
  }

  const handleFinish = async () => {
    if (!fullName.trim()) {
      alert("Iltimos, homilador ayol ismini kiriting")
      return
    }
    setProcessing(true)
    setStatusMsg("Backendga saqlanmoqda (POST /api/v1/patients)...")
    try {
      await createPatient({
        full_name: fullName,
        age: Number(age),
        phone,
        district,
        gestational_weeks: Number(gestationalWeeks),
        gravidity: Number(gravidity),
        parity: Number(parity),
        blood_group: bloodGroup,
        systolic_bp: Number(systolic),
        diastolic_bp: Number(diastolic),
        heart_rate: Number(heartRate),
        proteinuria,
      })
      onComplete()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden font-sans">
      <div className="bg-[#1E3A8A] text-white p-3.5 flex items-center justify-between">
        <span className="font-bold text-sm">Register Pregnancy</span>
        <span className="text-xs text-blue-200 font-normal">Finalize Registration</span>
      </div>

      <div className="bg-[#172554] p-2 flex items-center justify-between text-white text-xs px-4">
        <button onClick={onComplete} className="p-1 rounded hover:bg-blue-900 text-blue-200 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleFinish}
          disabled={processing}
          className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold px-12 py-1.5 rounded-full tracking-wider uppercase text-xs flex items-center gap-2 shadow-xs transition"
        >
          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          FINISH
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-4" />
      </div>

      <div className="p-6 space-y-6 text-sm text-slate-800">
        <div className="space-y-4 border-b border-slate-100 pb-5">
          <div>
            <label className="font-semibold text-xs text-slate-900 block mb-1">
              Homilador ayol F.I.Sh (To'liq ismi): *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Lola Xudoyberganova"
              className="w-full h-10 px-3 border-b-2 border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm bg-transparent font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-medium text-slate-700">Tug'ilgan sanasi aniqmi? *</label>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="dob"
                  checked={dobKnown === "yes"}
                  onChange={() => setDobKnown("yes")}
                  className="accent-[#1E3A8A]"
                />
                Ha
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="dob"
                  checked={dobKnown === "no"}
                  onChange={() => setDobKnown("no")}
                  className="accent-[#1E3A8A]"
                />
                Yo'q
              </label>
              <button
                onClick={() => setDobKnown("no")}
                className="text-[11px] font-semibold text-[#1E3A8A] border border-[#1E3A8A] px-2.5 py-0.5 rounded-full hover:bg-blue-50"
              >
                CLEAR
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Yoshi: *</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-9 px-2 border-b-2 border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Telefon raqami: *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-2 border-b-2 border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Kamera va OCR bloki */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-800 block">
            Almashinuv varaqasi yoki Tonometr ko'rsatkichini suratga olish (OCR):
          </label>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleImageCapture}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageCapture}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={processing}
              className="bg-[#4159A4] hover:bg-[#324580] text-white py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Camera className="w-4 h-4" /> TAKE PICTURE
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="bg-[#4159A4] hover:bg-[#324580] text-white py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition"
            >
              <ImageIcon className="w-4 h-4" /> CHOOSE IMAGE
            </button>
          </div>

          {statusMsg && (
            <p className="text-xs text-blue-800 font-medium flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {statusMsg}
            </p>
          )}
        </div>

        {/* Vitallar */}
        <div className="space-y-3">
          <label className="font-semibold text-xs text-slate-800 block">
            Dastlabki Qon Bosimi (mmHg) va Puls:
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Sistolik BP</span>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className={`w-full h-9 px-3 rounded border text-center font-bold text-sm ${
                  Number(systolic) >= 140 ? "border-rose-500 bg-rose-50 text-rose-800" : "border-slate-300"
                }`}
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Diastolik BP</span>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className={`w-full h-9 px-3 rounded border text-center font-bold text-sm ${
                  Number(diastolic) >= 90 ? "border-rose-500 bg-rose-50 text-rose-800" : "border-slate-300"
                }`}
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Puls (HR)</span>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 text-center font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-3 rounded bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
          Ma'lumotlar saqlangach, AI avtomatik MEOWS/Stacking baholashini amalga oshiradi va bemor <strong>Follow Up</strong> ro'yxatida xavf bayrog'i bilan chiqadi.
        </div>
      </div>
    </div>
  )
}
