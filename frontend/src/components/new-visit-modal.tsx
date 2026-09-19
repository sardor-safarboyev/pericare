import React, { useState, useRef } from "react"
import {
  Camera,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

interface Props {
  isOpen: boolean
  onClose: () => void
  preselectedPatientId?: string
}

export function NewVisitModal({ isOpen, onClose, preselectedPatientId }: Props) {
  const { patients, addEncounter, extractOcr } = useStore()

  const [patientId, setPatientId] = useState(preselectedPatientId || patients[0]?.id || "")
  const [systolic, setSystolic] = useState("120")
  const [diastolic, setDiastolic] = useState("80")
  const [heartRate, setHeartRate] = useState("75")
  const [proteinuria, setProteinuria] = useState<"negative" | "trace" | "1+" | "2+" | "3+">("negative")
  const [notes, setNotes] = useState("")

  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [ocrSuccess, setOcrSuccess] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsOcrLoading(true)
    setOcrError(null)
    setOcrSuccess(false)

    try {
      const res = await extractOcr(file)
      if (res.systolic && res.diastolic) {
        setSystolic(String(res.systolic))
        setDiastolic(String(res.diastolic))
        if (res.heartRate) setHeartRate(String(res.heartRate))
        setOcrSuccess(true)
      } else {
        setOcrError("Rasmdan raqamlarni ajratib bo'lmadi. Iltimos, qo'lda kiriting.")
      }
    } catch {
      setOcrError("OCR serveri javob bermadi.")
    } finally {
      setIsOcrLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) return

    addEncounter(
      patientId,
      {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        heartRate: Number(heartRate),
        proteinuria,
      },
      notes
    )
    onClose()
  }

  const isHighBp = Number(systolic) >= 140 || Number(diastolic) >= 90

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Modal Sarlavhasi */}
        <div className="bg-[#1E3A8A] text-white p-3.5 px-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm">Yangi Ko'rik / Skrining</h3>
            <p className="text-[11px] text-blue-200">Vital parametrlar va avtomatik MEOWS baholash</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Forma Tanasi */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Bemor tanlash */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Homilador Ayol:</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 font-medium bg-white text-xs"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.age} yosh, {p.gestationalWeeks} hafta)
                </option>
              ))}
            </select>
          </div>

          {/* OCR Kamera / Galereya */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-2.5">
            <span className="font-bold text-slate-800 block text-[11px]">
              Tonometr yoki Blankni Suratga Olish (AI OCR):
            </span>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleImage}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleImage}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isOcrLoading}
                onClick={() => cameraInputRef.current?.click()}
                className="h-10 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>Rasmga Olish</span>
              </button>

              <button
                type="button"
                disabled={isOcrLoading}
                onClick={() => galleryInputRef.current?.click()}
                className="h-10 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-bold flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Galereyadan</span>
              </button>
            </div>

            {ocrSuccess && (
              <p className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ko'rsatkichlar rasmdan aniq o'qildi va to'ldirildi!
              </p>
            )}
            {ocrError && (
              <p className="text-rose-600 font-medium text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {ocrError}
              </p>
            )}
          </div>

          {/* Bosim va Puls */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">
              Arterial Qon Bosimi (mmHg) va Puls:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Sistolik (SYS)</span>
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className={`w-full h-10 px-2 rounded-lg border text-center font-bold text-sm ${
                    isHighBp ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-300"
                  }`}
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Diastolik (DIA)</span>
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className={`w-full h-10 px-2 rounded-lg border text-center font-bold text-sm ${
                    isHighBp ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-300"
                  }`}
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Puls (HR)</span>
                <input
                  type="number"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full h-10 px-2 rounded-lg border border-slate-300 text-center font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Siydik Oqsili */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Siydik Oqsili (Proteinuria):</label>
            <select
              value={proteinuria}
              onChange={(e) => setProteinuria(e.target.value as any)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 font-medium bg-white text-xs"
            >
              <option value="negative">Manfiy (-)</option>
              <option value="trace">Izlari (Trace)</option>
              <option value="1+">1+ (0.3 g/L)</option>
              <option value="2+">2+ (1.0 g/L - Kritik)</option>
              <option value="3+">3+ (3.0 g/L - Og'ir)</option>
            </select>
          </div>

          {/* Izoh */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Doya / Shifokor Qaydlari:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Bosh og'rig'i, ko'rishning xiralashishi..."
              className="w-full h-10 px-3 rounded-lg border border-slate-300 font-normal text-xs"
            />
          </div>

          {/* Tugmalar */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bekor Qilish
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-lg bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold shadow-sm"
            >
              Ko'rikni Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
