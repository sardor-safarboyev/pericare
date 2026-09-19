"use client";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { Activity, ArrowUpRight, Clock, ScanLine, TriangleAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { RISK_LABELS, SYNDROME_LABELS, formatRelativeTime, riskClasses } from "@/lib/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
const RISK_COLORS = {
    green: "var(--safe)",
    yellow: "var(--moderate)",
    red: "var(--critical)",
};
export function DashboardView({ onNavigate, onTriage, }) {
    const { dashboard, patients, referrals, user } = useStore();
    const criticalPatients = patients.filter((p) => p.riskZone === "red");
    const activeReferrals = referrals.filter((r) => r.status !== "admitted");
    const stats = [
        {
            label: "Total Screened",
            value: dashboard.totalScreened.toLocaleString(),
            icon: Activity,
            sub: "+128 this week",
            tone: "text-primary",
        },
        {
            label: "Red Criticals",
            value: dashboard.redCriticals,
            icon: TriangleAlert,
            sub: "Escalated cases",
            tone: "text-critical",
        },
        {
            label: "Avg Referral SLA",
            value: `${dashboard.avgReferralSlaMinutes}m`,
            icon: Clock,
            sub: "Target < 30m",
            tone: "text-moderate",
        },
        {
            label: "OCR Accuracy",
            value: `${(dashboard.ocrAccuracy * 100).toFixed(1)}%`,
            icon: ScanLine,
            sub: "Vitals extraction",
            tone: "text-safe",
        },
    ];
    return (<div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {greeting()}, {user?.fullName?.split(" ")[0] ?? "Clinician"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeReferrals.length} active referral{activeReferrals.length === 1 ? "" : "s"} ·{" "}
            {criticalPatients.length} critical patient{criticalPatients.length === 1 ? "" : "s"} in
            your caseload
          </p>
        </div>
        <Button onClick={() => onTriage()} className="gap-2 self-start sm:self-auto">
          <Activity className="size-4"/> New triage
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, sub, tone }) => (<Card key={label} className="flex flex-col gap-2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`size-4 ${tone}`}/>
            </div>
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
          </Card>))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Volume chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <CardTitle>Screening Volume (14 days)</CardTitle>
            <span className="text-xs text-muted-foreground">Triage vs Admissions</span>
          </div>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.dailyVolume} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="gTriage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gAdm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--critical)" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="var(--critical)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={1}/>
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={44}/>
                  <Tooltip content={<ChartTooltip />}/>
                  <Area type="monotone" dataKey="triage" stroke="var(--primary)" strokeWidth={2} fill="url(#gTriage)" name="Triage"/>
                  <Area type="monotone" dataKey="admissions" stroke="var(--critical)" strokeWidth={2} fill="url(#gAdm)" name="Admissions"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboard.riskDistribution} dataKey="count" nameKey="zone" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                    {dashboard.riskDistribution.map((d) => (<Cell key={d.zone} fill={RISK_COLORS[d.zone]}/>))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix=" patients"/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold">
                  {dashboard.riskDistribution.reduce((a, b) => a + b.count, 0).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">screened</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {dashboard.riskDistribution.map((d) => (<div key={d.zone} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: RISK_COLORS[d.zone] }}/>
                  <span className="flex-1 text-muted-foreground">{RISK_LABELS[d.zone]}</span>
                  <span className="font-medium">{d.count.toLocaleString()}</span>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Critical patients */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <CardTitle>Priority Caseload</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("patients")} className="gap-1">
              All patients <ArrowUpRight className="size-4"/>
            </Button>
          </div>
          <CardContent className="flex flex-col gap-2">
            {patients
            .slice()
            .sort((a, b) => zoneRank(b.riskZone) - zoneRank(a.riskZone))
            .slice(0, 5)
            .map((p) => (<button key={p.id} onClick={() => onTriage(p.id)} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${riskClasses(p.riskZone).badge}`}>
                    {initials(p.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.gestationalWeeks}w · {SYNDROME_LABELS[p.syndrome]}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RiskBadge zone={p.riskZone} showDot={false}/>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(p.lastVisit)}
                    </span>
                  </div>
                </button>))}
          </CardContent>
        </Card>

        {/* Top syndromes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Syndromes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.topSyndromes.map((s) => ({
            name: SYNDROME_LABELS[s.syndrome],
            count: s.count,
        }))} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <XAxis type="number" hide/>
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTooltip suffix=" cases"/>} cursor={{ fill: "var(--muted)" }}/>
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={16}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
function ChartTooltip({ active, payload, label, suffix = "", }) {
    if (!active || !payload?.length)
        return null;
    return (<div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((p, i) => (<div key={i} className="flex items-center gap-2 text-muted-foreground">
          {p.color && <span className="size-2 rounded-full" style={{ background: p.color }}/>}
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto font-medium text-popover-foreground">
            {p.value}
            {suffix}
          </span>
        </div>))}
    </div>);
}
function greeting() {
    const h = new Date().getHours();
    if (h < 12)
        return "Good morning";
    if (h < 18)
        return "Good afternoon";
    return "Good evening";
}
function zoneRank(z) {
    return z === "red" ? 3 : z === "yellow" ? 2 : 1;
}
function initials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}
