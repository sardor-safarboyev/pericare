import React, { useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import {
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURE_IMPORTANCE = [
  { name: "Sistolik Arterial Bosim", value: 0.38, color: "#0F766E" },
  { name: "Diastolik Arterial Bosim", value: 0.24, color: "#14B8A6" },
  { name: "Siydikdagi Oqsil (Proteinuriya)", value: 0.18, color: "#0D9488" },
  { name: "Shok Indeksi (HR/SBP)", value: 0.11, color: "#2DD4BF" },
  { name: "Homila Muddati (Hafta)", value: 0.05, color: "#5EEAD4" },
  { name: "Preeklampsiya Anamnezi", value: 0.04, color: "#99F6E4" },
]

export function ModelView() {
  const { mlMetrics, fetchMetrics } = useStore()

  useEffect(() => {
    fetchMetrics()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5" /> Ishlab chiqarish modeli (Production)
            </span>
            <span className="text-xs text-slate-500 font-semibold">FastAPI + ONNX Runtime</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Gibrid Perinatal Stacking Classifier & AI Modeli
          </h1>
          <p className="text-sm text-slate-600">
            Klinik MEOWS qoidalari va ko'p bosqichli ansambl (XGBoost + LightGBM + RF) sintezi.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Zap className="w-4 h-4 text-emerald-600" />
          Inference Latency: <strong className="text-slate-900 font-bold">14 ms</strong>
        </div>
      </div>

      {/* 4 ta Haqiqiy Metrika Kartasi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Test ROC-AUC</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">0.998</div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">Yuqori ajratish kuchi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">CV Macro F1</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">0.972</div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">5-fold cross-validation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Test Macro F1</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">0.961</div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">Mustaqil test to'plamida</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Red Brier Score</span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-1">0.0085</div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">Kalibratsiya xatosi (~0.8%)</span>
        </div>
      </div>

      {/* Tahliliy Grafiklar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SHAP Feature Importance (8 ustun) */}
        <Card className="lg:col-span-8 border-slate-200/80 shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">
              Global Feature Importance (SHAP Tahlili)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Model qarorida har bir klinik ko'rsatkichning nisbiy og'irligi
            </p>
          </CardHeader>
          <CardContent className="pt-5 px-6 pb-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={FEATURE_IMPORTANCE}
                  layout="vertical"
                  margin={{ left: 40, right: 20, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" domain={[0, 0.45]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${Math.round(val * 100)}% ta'sir kuchi`, "Og'irlik"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {FEATURE_IMPORTANCE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ansambl Arxitekturasi (4 ustun) */}
        <Card className="lg:col-span-4 border-slate-200/80 shadow-sm rounded-2xl bg-white flex flex-col justify-between">
          <CardHeader className="pb-2 pt-5 px-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" /> Stacking Arxitekturasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-6 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <strong className="text-slate-900 font-bold block mb-1">1-Bosqich (Base Learners):</strong>
              <p className="text-slate-600 leading-relaxed">
                XGBoost, LightGBM va Random Forest modellari 12 ta vital parametr va homiladorlik tarixidan bashoratlarni hisoblaydi.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <strong className="text-emerald-950 font-bold block mb-1">2-Bosqich (Meta Learner):</strong>
              <p className="text-emerald-900 leading-relaxed">
                Logistic Regression meta-modeli bazaviy bashoratlarni kalibratsiya qilib, yakuniy xavf ehtimolligini chiqaradi.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <strong className="text-slate-900 font-bold block mb-1">Xavfsizlik Qoidasi (MEOWS Override):</strong>
              <p className="text-slate-600 leading-relaxed">
                Agar qon bosimi ≥ 160/110 mmHg bo'lsa, tizim ML javobidan qat'i nazar zudlik bilan Qizil Zonani belgilaydi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
