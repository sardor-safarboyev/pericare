"use client";
import { useState } from "react";
import { Activity, HeartPulse, ShieldCheck, Stethoscope, WifiOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { FACILITY_LABELS, ROLE_LABELS } from "@/lib/clinical";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
const roles = Object.keys(ROLE_LABELS);
const facilities = Object.keys(FACILITY_LABELS);
export function AuthScreen() {
    const { login, register } = useStore();
    const [mode, setMode] = useState("login");
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("amina.clinic@sentinel.health");
    const [password, setPassword] = useState("demo1234");
    const [role, setRole] = useState("midwife");
    const [facility, setFacility] = useState("district_maternity");
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "login") {
                await login(email, role, facility);
            }
            else {
                await register({ fullName, email, password, role, facility });
            }
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Brand / hero panel */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:w-[46%] lg:p-12">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-2xl"/>
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-black/10 blur-2xl"/>
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <HeartPulse className="size-5"/>
          </div>
          <span className="text-lg font-semibold tracking-tight">Sentinel</span>
        </div>

        <div className="relative my-10 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance lg:text-4xl">
            Catching maternal risk before it becomes an emergency.
          </h1>
          <p className="mt-4 text-pretty text-primary-foreground/80">
            AI-assisted triage, OCR vitals capture and referral coordination — built for
            frontline antenatal care in low-connectivity settings.
          </p>
        </div>

        <ul className="relative flex flex-col gap-3 text-sm">
          {[
            { icon: Activity, text: "Stacking-classifier risk scoring with SHAP explanations" },
            { icon: ShieldCheck, text: "Traffic-light triage: green, yellow, red escalation" },
            { icon: WifiOff, text: "Offline-first capture with background sync" },
        ].map(({ icon: Icon, text }) => (<li key={text} className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
                <Icon className="size-4"/>
              </span>
              <span className="text-primary-foreground/90">{text}</span>
            </li>))}
        </ul>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <Stethoscope className="size-5 text-primary"/>
            <span className="text-lg font-semibold">Sentinel</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
            ? "Sign in to your clinical workspace."
            : "Register to start screening patients."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {["login", "register"].map((m) => (<button key={m} type="button" onClick={() => setMode(m)} className={cn("rounded-lg py-2 text-sm font-medium capitalize transition-colors", mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground")}>
                {m === "login" ? "Sign in" : "Register"}
              </button>))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {mode === "register" && (<div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Amina Yusuf"/>
              </div>)}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@facility.health"/>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">Role</Label>
                <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => (<option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="facility">Facility</Label>
                <Select id="facility" value={facility} onChange={(e) => setFacility(e.target.value)}>
                  {facilities.map((f) => (<option key={f} value={f}>
                      {FACILITY_LABELS[f]}
                    </option>))}
                </Select>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
              {loading
            ? "Please wait…"
            : mode === "login"
                ? "Sign in to workspace"
                : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo environment — credentials are pre-filled. No real data is stored.
          </p>
        </div>
      </main>
    </div>);
}
