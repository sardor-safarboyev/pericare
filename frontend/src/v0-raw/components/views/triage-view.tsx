"use client"

import { useState } from "react"
import { Activity, ArrowRight, ScanLine, Send, Sparkles, Stethoscope } from "lucide-react"
import { useStore } from "@/lib/store"
import {
  PROTEINURIA_LEVELS,
  RISK_LABELS,
  SYNDROME_LABELS,
  riskClasses,
  shockIndexBand,
} from "@/lib/clinical"
import type { TriageResult, Vitals } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select } from "@/components/ui/select"
import { RiskBadge } from "@/components/risk-badge"
import type { ViewKey } from "@/components/app-shell"
import { cn } from "@/lib/utils"

const DEFAULT_VITALS: Vitals = {
  systolic: 120,
  diastolic: 78,
  heartRate: 82,
  spo2: 98,
  temperature: 36.8,
  proteinuria: "negative",
}

export function TriageView({
  initialPatientId,
  onNavigate,
}: {
  initialPatientId?: string
  onNavigate: (v: ViewKey) => void
}) {
  const { patients, extractOcr, evaluateTriage, createReferral } = useStore()
  const [patientId, setPatientId] = useState(initialPatientId ?? "")
  const [vitals, setVitals] = useState<Vitals>(DEFAULT_VITALS)
  const [scanning, setScanning] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [referred, setReferred] = useState(false)

  function set<K extends keyof Vitals>(key: K, value: Vitals[K]) {
    setVitals((v) => ({ ...v, [key]: value }))
    setResult(null)
    setReferred(false)
  }

  async function runOcr() {
    setScanning(true)
    setOcrConfidence(null)
    try {
      const ocr = await extractOcr()
      setVitals((v) => ({
        ...v,
        systolic: ocr.systolic,
        diastolic: ocr.diastolic,
        heartRate: ocr.heartRate,
        spo2: ocr.spo2,
        temperature: ocr.temperature,
      }))
      setOcrConfidence(ocr.confidence)
      setResult(null)
    } finally {
      setScanning(false)
    }
  }

  async function runEvaluation() {
    setEvaluating(true)
    try {
      const r = await evaluateTriage(vitals, patientId || undefined)
      setResult(r)
    } finally {
      setEvaluating(false)
    }
  }

  function handleReferral() {
    if (!result) return
    createReferral(result)
    setReferred(true)
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.05fr]">
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Patient &amp; Vitals</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient">Patient</Label>
              <Select
                id="patient"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value)
                  setResult(null)
                }}
              >
                <option value="">Ad-hoc screening (unassigned)</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} · {p.gestationalWeeks}w
                  </option>
                ))}
              </Select>
            </div>

            <button
              type="button"
              onClick={runOcr}
              disabled={scanning}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10 disabled:opacity-70",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ScanLine className={cn("size-5", scanning && "animate-pulse")} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  {scanning ? "Scanning paper chart…" : "Scan paper chart (OCR)"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {scanning
                    ? "Extracting vitals with the vision model"
                    : "Auto-fill vitals from a photographed vitals card"}
                </span>
              </span>
              {ocrConfidence !== null && !scanning && (
                <span className="rounded-full bg-safe-muted px-2 py-1 text-xs font-medium text-safe">
                  {(ocrConfidence * 100).toFixed(1)}%
                </span>
              )}
              {scanning && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-primary" />
              )}
            </button>

            <div className="flex flex-col gap-5">
              <VitalSlider
                label="Systolic BP"
                unit="mmHg"
                value={vitals.systolic}
                min={80}
                max={200}
                onChange={(v) => set("systolic", v)}
                danger={vitals.systolic >= 160}
                warn={vitals.systolic >= 140}
              />
              <VitalSlider
                label="Diastolic BP"
                unit="mmHg"
                value={vitals.diastolic}
                min={50}
                max={130}
                onChange={(v) => set("diastolic", v)}
                danger={vitals.diastolic >= 110}
                warn={vitals.diastolic >= 90}
              />
              <VitalSlider
                label="Heart rate"
                unit="bpm"
                value={vitals.heartRate}
                min={40}
                max={160}
                onChange={(v) => set("heartRate", v)}
                danger={vitals.heartRate > 120}
                warn={vitals.heartRate > 100}
              />
              <VitalSlider
                label="SpO₂"
                unit="%"
                value={vitals.spo2}
                min={80}
                max={100}
                onChange={(v) => set("spo2", v)}
                danger={vitals.spo2 < 92}
                warn={vitals.spo2 < 95}
              />
              <VitalSlider
                label="Temperature"
                unit="°C"
                value={vitals.temperature}
                min={34}
                max={41}
                step={0.1}
                onChange={(v) => set("temperature", v)}
                danger={vitals.temperature >= 38.5}
                warn={vitals.temperature >= 38}
              />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proteinuria">Proteinuria (dipstick)</Label>
                <Select
                  id="proteinuria"
                  value={vitals.proteinuria}
                  onChange={(e) => set("proteinuria", e.target.value as Vitals["proteinuria"])}
                >
                  {PROTEINURIA_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <Button onClick={runEvaluation} disabled={evaluating} size="lg" className="gap-2">
              {evaluating ? (
                <>
                  <Sparkles className="size-4 animate-pulse" /> Evaluating risk…
                </>
              ) : (
                <>
                  <Activity className="size-4" /> Evaluate triage risk
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result panel */}
      <div className="flex flex-col gap-4">
        {result ? (
          <ResultPanel
            result={result}
            referred={referred}
            onRefer={handleReferral}
            onViewReferrals={() => onNavigate("referrals")}
          />
        ) : (
          <EmptyResult evaluating={evaluating} />
        )}
      </div>
    </div>
  )
}

function VitalSlider({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
  danger,
  warn,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  danger?: boolean
  warn?: boolean
}) {
  const tone = danger ? "text-critical" : warn ? "text-moderate" : "text-foreground"
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className={cn("text-sm font-semibold tabular-nums", tone)}>
          {step < 1 ? value.toFixed(1) : value}
          <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(danger && "accent-critical", warn && !danger && "accent-moderate")}
      />
    </div>
  )
}

function EmptyResult({ evaluating }: { evaluating: boolean }) {
  return (
    <Card className="flex min-h-80 flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Stethoscope className="size-7" />
      </span>
      <p className="text-sm font-medium">
        {evaluating ? "Running the stacking classifier…" : "Awaiting evaluation"}
      </p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Enter or scan vitals, then run the triage model to see the risk zone, likely syndrome and
        explainable factors.
      </p>
    </Card>
  )
}

function ResultPanel({
  result,
  referred,
  onRefer,
  onViewReferrals,
}: {
  result: TriageResult
  referred: boolean
  onRefer: () => void
  onViewReferrals: () => void
}) {
  const rc = riskClasses(result.riskZone)
  const si = shockIndexBand(result.shockIndex)
  const maxContribution = Math.max(...result.shapFactors.map((f) => Math.abs(f.contribution)))

  return (
    <>
      <Card className={cn("overflow-hidden border-0 ring-1", rc.ring)}>
        <div className={cn("flex items-center justify-between p-5", rc.bg)}>
          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-wide", rc.text)}>
              {RISK_LABELS[result.riskZone]}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {SYNDROME_LABELS[result.syndrome]}
            </p>
          </div>
          <div className={cn("flex size-16 flex-col items-center justify-center rounded-full", rc.solid)}>
            <span className="text-lg font-bold leading-none">
              {Math.round(result.probability * 100)}
            </span>
            <span className="text-[10px] opacity-90">risk %</span>
          </div>
        </div>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Shock Index" value={result.shockIndex.toFixed(2)} sub={si.label} zone={si.zone} />
            <Metric
              label="Model Probability"
              value={`${Math.round(result.probability * 100)}%`}
              sub="Adverse outcome"
            />
          </div>

          <div className={cn("rounded-xl p-4", rc.bg)}>
            <p className={cn("text-xs font-semibold uppercase tracking-wide", rc.text)}>
              Recommended action
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{result.recommendation}</p>
          </div>

          {result.riskZone === "red" &&
            (referred ? (
              <Button variant="outline" onClick={onViewReferrals} className="gap-2">
                Referral created — track it <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={onRefer} className="gap-2 bg-critical text-critical-foreground hover:bg-critical/90">
                <Send className="size-4" /> Escalate &amp; create referral
              </Button>
            ))}
        </CardContent>
      </Card>

      {/* SHAP explainability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" /> Explainable factors (SHAP)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {result.shapFactors.map((f) => {
            const positive = f.contribution >= 0
            const width = (Math.abs(f.contribution) / maxContribution) * 100
            return (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">{f.feature}</span>
                <div className="relative flex h-6 flex-1 items-center">
                  <div className="absolute left-1/2 h-full w-px bg-border" />
                  <div
                    className={cn(
                      "absolute h-3 rounded-sm",
                      positive ? "left-1/2 bg-critical" : "right-1/2 bg-safe",
                    )}
                    style={{ width: `${width / 2}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "w-12 shrink-0 text-right text-xs font-medium tabular-nums",
                    positive ? "text-critical" : "text-safe",
                  )}
                >
                  {positive ? "+" : ""}
                  {f.contribution.toFixed(2)}
                </span>
              </div>
            )
          })}
          <p className="mt-1 text-xs text-muted-foreground">
            Red bars push risk up, green bars pull it down — mirroring the model&apos;s SHAP values.
          </p>
        </CardContent>
      </Card>
    </>
  )
}

function Metric({
  label,
  value,
  sub,
  zone,
}: {
  label: string
  value: string
  sub: string
  zone?: "green" | "yellow" | "red"
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {zone ? (
        <RiskBadge zone={zone} label={sub} showDot className="mt-1" />
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}
