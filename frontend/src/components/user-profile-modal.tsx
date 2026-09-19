import React from "react"
import {
  User,
  Hospital,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  X,
  Wifi,
  Database
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function UserProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { user, syncState, offlineQueue, patients } = useStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* CommCare Navy Header */}
        <div className="bg-[#2B4380] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Foydalanuvchi Profili</h3>
              <p className="text-[11px] text-blue-200 font-normal">Tibbiyot xodimi ma'lumotlari</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-blue-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Asosiy ma'lumotlar */}
          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-full bg-[#2B4380] text-white flex items-center justify-center font-bold text-base">
              {user.fullName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{user.fullName}</h4>
              <p className="text-xs text-[#2B4380] font-medium">{user.roleName}</p>
              <p className="text-[11px] text-slate-500 font-normal">{user.facility}</p>
            </div>
          </div>

          {/* Aloqa va Muassasa tafsilotlari */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-400 block text-[11px] font-normal flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telefon raqam
              </span>
              <strong className="text-slate-800 font-medium mt-0.5 block">{user.phone}</strong>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-400 block text-[11px] font-normal flex items-center gap-1">
                <Mail className="w-3 h-3" /> E-pochta
              </span>
              <strong className="text-slate-800 font-medium mt-0.5 block truncate">{user.email}</strong>
            </div>
          </div>

          {/* Hudud va Biriktirilgan kontingent */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-normal">
                <Hospital className="w-3.5 h-3.5 text-slate-400" /> Biriktirilgan Dispanser:
              </span>
              <span className="font-medium text-slate-900">Urganch TTB Tug'ruqxonasi</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-normal">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Hisobdagi Homiladorlar:
              </span>
              <span className="font-semibold text-slate-900">{patients.length} nafar faol case</span>
            </div>
          </div>

          {/* Offline / Kesh holati */}
          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Database className="w-4 h-4 text-blue-700" />
              <div>
                <span className="font-medium text-slate-900 block">Lokal Kesh va Sinxronizatsiya</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {syncState === "online" ? "Serverga to'liq ulangan" : "Oflayn keshda ishlayapti"}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-blue-800 border border-blue-200">
              {offlineQueue.length} ta kutilayotgan
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-[#2B4380] hover:bg-[#1E3A8A] text-white text-xs font-medium h-8 px-4 rounded-md"
          >
            Yopish
          </Button>
        </div>
      </div>
    </div>
  )
}
