"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Cpu, Gauge, Layers, Timer } from "lucide-react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURE_IMPORTANCE = [
  { feature: "Systolic BP", value: 0.28 },
  { feature: "Proteinuria", value: 0.19 },
  { feature: "Diastolic BP", value: 0.17 },
  { feature: "Shock Index", value: 0.14 },
  { feature: "SpO₂", value: 0.11 },
  { feature: "Temperature", value: 0.07 },
  { feature: "Prior PE", value: 0.04 },
]

// Mock ROC curve points (fpr, tpr)
const ROC = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.02, tpr: 0.42 },
  { fpr: 0.05, tpr: 0.63 },
  { fpr: 0.1, tpr: 0.78 },
  { fpr: 0.18, tpr: 0.88 },
  { fpr: 0.3, tpr: 0.94 },
  { fpr: 0.5, tpr: 0.98 },
  { fpr: 0.75, tpr: 0.995 },
  { fpr: 1, tpr: 1 },
]

export function ModelView() {
  const { mlMetrics } = useStore()

  const metrics = [
    { label: "AUC-ROC", value: mlMetrics.aucRoc, icon: Gauge, tone: "text-primary" },
    { label: "Precision", value: mlMetrics.precision, icon: Layers, tone: "text-safe" },
    { label: "Recall", value: mlMetrics.recall, icon: Layers, tone: "text-moderate" },
    { label: "F1 Score", value: mlMetrics.f1, icon: Cpu, tone: "text-primary" },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cpu className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Production model</p>
            <p className="font-semibold tracking-tight">{mlMetrics.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-safe-muted px-3 py-2 text-sm text-safe">
          <Timer className="size-4" />
          {mlMetrics.inferenceLatencyMs}ms median inference
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`size-4 ${tone}`} />
            </div>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {value.toFixed(3)}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ROC Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ROC} margin={{ left: -18, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rocFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="fpr"
                    type="number"
                    domain={[0, 1]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(1)}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => v.toFixed(1)}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => v.toFixed(3)}
                  />
                  <ReferenceLine
                    segment={[
                      { x: 0, y: 0 },
                      { x: 1, y: 1 },
                    ]}
                    stroke="var(--border)"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="tpr"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#rocFill)"
                    name="True positive rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              AUC = {mlMetrics.aucRoc.toFixed(3)} · dashed line marks random baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 12, right: 16 }}>
                  <XAxis type="number" hide domain={[0, 0.3]} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    width={90}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                    {FEATURE_IMPORTANCE.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? "var(--primary)" : "color-mix(in oklch, var(--primary) 55%, transparent)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Architecture</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            {
              title: "Base learners",
              body: "XGBoost, Random Forest and Logistic Regression trained on vitals, dipstick and obstetric history features.",
            },
            {
              title: "Meta learner",
              body: "Logistic Regression stacks out-of-fold base predictions to calibrate the final probability.",
            },
            {
              title: "Serving",
              body: "Exported to ONNX and served from FastAPI with SHAP explanations returned per request.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
