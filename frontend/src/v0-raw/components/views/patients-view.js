"use client";
import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CloudOff, Plus, Radar, Search, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { SYNDROME_LABELS, formatRelativeTime, riskClasses } from "@/lib/clinical";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { RiskBadge } from "@/components/risk-badge";
import { cn } from "@/lib/utils";
const FILTERS = [
    { key: "all", label: "All" },
    { key: "red", label: "Critical" },
    { key: "yellow", label: "Moderate" },
    { key: "green", label: "Low" },
];
export function PatientsView({ onTriage }) {
    const { patients } = useStore();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const filtered = useMemo(() => {
        return patients.filter((p) => {
            const matchesQuery = p.fullName.toLowerCase().includes(query.toLowerCase());
            const matchesFilter = filter === "all" || p.riskZone === filter;
            return matchesQuery && matchesFilter;
        });
    }, [patients, query, filter]);
    return (<div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients…" className="pl-9"/>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 self-start sm:self-auto">
          <UserPlus className="size-4"/> New patient
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (<button key={f.key} onClick={() => setFilter(f.key)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition-colors", filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground")}>
            {f.label}
          </button>))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (<Card key={p.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold", riskClasses(p.riskZone).badge)}>
                {initials(p.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium">{p.fullName}</p>
                  {!p.synced && (<CloudOff className="size-3.5 shrink-0 text-moderate" aria-label="Not synced"/>)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.age}y · G{p.gravidity}P{p.parity} · {p.gestationalWeeks}w
                </p>
              </div>
              <RiskBadge zone={p.riskZone} showDot={false}/>
            </div>

            <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Assessment: </span>
              <span className="font-medium">{SYNDROME_LABELS[p.syndrome]}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(p.lastVisit)}
              </span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setDetail(p)}>
                  History
                </Button>
                <Button size="sm" onClick={() => onTriage(p.id)} className="gap-1.5">
                  <Radar className="size-3.5"/> Triage
                </Button>
              </div>
            </div>
          </Card>))}

        {filtered.length === 0 && (<div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <Search className="size-6 text-muted-foreground"/>
            <p className="text-sm font-medium">No patients found</p>
            <p className="text-xs text-muted-foreground">Try a different search or filter.</p>
          </div>)}
      </div>

      <CreatePatientModal open={createOpen} onClose={() => setCreateOpen(false)}/>
      <PatientDetail patient={detail} onClose={() => setDetail(null)} onTriage={onTriage}/>
    </div>);
}
function CreatePatientModal({ open, onClose }) {
    const { createPatient, syncState } = useStore();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        age: 28,
        gestationalWeeks: 30,
        gravidity: 1,
        parity: 0,
        previousPreeclampsia: false,
    });
    function update(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }
    async function submit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await createPatient(form);
            onClose();
            setForm({
                fullName: "",
                age: 28,
                gestationalWeeks: 30,
                gravidity: 1,
                parity: 0,
                previousPreeclampsia: false,
            });
        }
        finally {
            setSaving(false);
        }
    }
    return (<Modal open={open} onClose={onClose} title="Register new patient">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Patient name"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Age" value={form.age} min={12} max={60} onChange={(v) => update("age", v)}/>
          <NumberField label="Gestation (weeks)" value={form.gestationalWeeks} min={4} max={44} onChange={(v) => update("gestationalWeeks", v)}/>
          <NumberField label="Gravidity" value={form.gravidity} min={1} max={15} onChange={(v) => update("gravidity", v)}/>
          <NumberField label="Parity" value={form.parity} min={0} max={15} onChange={(v) => update("parity", v)}/>
        </div>
        <label className="flex items-center justify-between rounded-xl border border-border p-3">
          <span className="text-sm">
            <span className="font-medium">Previous preeclampsia</span>
            <span className="block text-xs text-muted-foreground">
              Raises baseline risk in scoring
            </span>
          </span>
          <Switch checked={form.previousPreeclampsia} onCheckedChange={(v) => update("previousPreeclampsia", v)}/>
        </label>

        {syncState === "offline" && (<p className="flex items-center gap-2 rounded-lg bg-moderate-muted px-3 py-2 text-xs text-moderate">
            <CloudOff className="size-3.5"/> Offline — patient will queue for sync.
          </p>)}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Plus className="size-4"/>
            {saving ? "Saving…" : "Register patient"}
          </Button>
        </div>
      </form>
    </Modal>);
}
function NumberField({ label, value, min, max, onChange, }) {
    return (<div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}/>
    </div>);
}
function PatientDetail({ patient, onClose, onTriage, }) {
    const { getVitals } = useStore();
    if (!patient)
        return null;
    const records = getVitals(patient.id);
    const chartData = records.map((r) => ({
        name: r.visitLabel,
        systolic: r.systolic,
        diastolic: r.diastolic,
        heartRate: r.heartRate,
    }));
    return (<Modal open={!!patient} onClose={onClose} title={patient.fullName} size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge zone={patient.riskZone}/>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {SYNDROME_LABELS[patient.syndrome]}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {patient.gestationalWeeks}w · G{patient.gravidity}P{patient.parity}
          </span>
        </div>

        <div>
          <CardTitle className="mb-3 text-sm">Blood pressure &amp; heart rate trend</CardTitle>
          {chartData.length > 0 ? (<div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -18, right: 8, top: 8 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40}/>
                  <Tooltip contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 12,
            }}/>
                  <Line type="monotone" dataKey="systolic" stroke="var(--critical)" strokeWidth={2} dot={{ r: 2 }} name="Systolic"/>
                  <Line type="monotone" dataKey="diastolic" stroke="var(--moderate)" strokeWidth={2} dot={{ r: 2 }} name="Diastolic"/>
                  <Line type="monotone" dataKey="heartRate" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} name="Heart rate"/>
                </LineChart>
              </ResponsiveContainer>
            </div>) : (<p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No vitals recorded yet. Run a triage to capture the first reading.
            </p>)}
        </div>

        <div className="flex flex-col gap-2">
          <CardTitle className="text-sm">Visit history</CardTitle>
          {records.length > 0 ? (<div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Visit</th>
                    <th className="px-3 py-2 text-left font-medium">BP</th>
                    <th className="px-3 py-2 text-left font-medium">HR</th>
                    <th className="px-3 py-2 text-left font-medium">SpO₂</th>
                    <th className="px-3 py-2 text-left font-medium">Urine</th>
                  </tr>
                </thead>
                <tbody>
                  {records
                .slice()
                .reverse()
                .map((r) => (<tr key={r.id} className="border-t border-border">
                        <td className="px-3 py-2">{r.visitLabel}</td>
                        <td className="px-3 py-2 font-medium">
                          {r.systolic}/{r.diastolic}
                        </td>
                        <td className="px-3 py-2">{r.heartRate}</td>
                        <td className="px-3 py-2">{r.spo2}%</td>
                        <td className="px-3 py-2">{r.proteinuria}</td>
                      </tr>))}
                </tbody>
              </table>
            </div>) : (<p className="text-sm text-muted-foreground">No recorded visits.</p>)}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {
            onClose();
            onTriage(patient.id);
        }} className="gap-2">
            <Radar className="size-4"/> Run triage
          </Button>
        </div>
      </div>
    </Modal>);
}
function initials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}
