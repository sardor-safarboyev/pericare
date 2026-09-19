import React, { useState } from "react"
import { ShieldCheck, Lock, Mail, User, Hospital, Loader2, ArrowRight, UserCheck, Stethoscope } from "lucide-react"
import { useStore } from "@/lib/store"
import { FACILITY_LABELS, ROLE_LABELS } from "@/lib/clinical"
import type { ClinicalRole, FacilityType } from "@/lib/types"
import { Button } from "@/components/ui/button"

export function AuthScreen() {
  const { login, registerUser } = useStore()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("nodira.karimova@perisafe.uz")
  const [password, setPassword] = useState("password123")
  const [fullName, setFullName] = useState("Nodira Karimova")
  const [role, setRole] = useState<ClinicalRole>("nurse")
  const [facility, setFacility] = useState<FacilityType>("district_hospital")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    try {
      if (isRegister) {
        await registerUser({
          email,
          fullName,
          role,
          facility,
          password,
        })
        setIsRegister(false)
        setErrorMsg("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.")
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Tizimga kirishda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center p-4 font-sans antialiased text-slate-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Yuqori AppBar Brend */}
        <div className="bg-[#1E3A8A] text-white p-6 text-center">
          <div className="w-16 h-16 rounded-lg bg-white mx-auto flex items-center justify-center shadow-inner mb-3 p-1.5">
            <img src="/logo.png" alt="PeriCare" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">PeriCare</h2>
          <p className="text-xs text-blue-200 mt-1 font-normal">
            Klinik qaror qabul qilish va monitoring axborot tizimi
          </p>
        </div>

        {/* Tablar */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition ${
              !isRegister ? "bg-white text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tizimga Kirish
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition ${
              isRegister ? "bg-white text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Yangi Ro'yxatdan O'tish
          </button>
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mutaxassis F.I.Sh / Muassasa Nomi:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Dr. Erkin Yusupov"
                    className="w-full h-10 pl-9 pr-3 rounded border border-slate-300 text-xs focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Klinik Rol / Mas'uliyat:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ClinicalRole)}
                  className="w-full h-10 px-3 rounded border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-[#1E3A8A]"
                >
                  <option value="nurse">👩‍⚕️ Doya / Hamshira (Frontline Skrining)</option>
                  <option value="district_specialist">👨‍⚕️ Tuman Mutaxassisi (Akusher-Ginekolog)</option>
                  <option value="regional_specialist">🏥 Viloyat Mutaxassisi (Yuqori Darajali Ekspertiza)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Eslatma: Ushbu portal faqat tibbiyot xodimlari va muassasalar uchun mo'ljallangan.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Biriktirilgan Muassasa:
                </label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value as FacilityType)}
                  className="w-full h-10 px-3 rounded border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-[#1E3A8A]"
                >
                  {Object.entries(FACILITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">E-pochta manzili:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foydalanuvchi@perisafe.uz"
                className="w-full h-10 pl-9 pr-3 rounded border border-slate-300 text-xs focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Maxfiy Parol:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-3 rounded border border-slate-300 text-xs focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-xs h-10 rounded shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isRegister ? "Ro'yxatdan O'tish va Kirish" : "Tizimga Kirish"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="bg-slate-50 p-3.5 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Xorazm Viloyat Perinatal Markazi · PeriCare
        </div>
      </div>
    </div>
  )
}
