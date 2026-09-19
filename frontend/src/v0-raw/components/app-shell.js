"use client";
import { useState } from "react";
import { Cloud, CloudOff, HeartPulse, LayoutDashboard, LogOut, Menu, Radar, Send, Users, X, } from "lucide-react";
import { useStore } from "@/lib/store";
import { FACILITY_LABELS, ROLE_LABELS } from "@/lib/clinical";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const NAV = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "patients", label: "Patients", icon: Users },
    { key: "triage", label: "Triage", icon: Radar },
    { key: "referrals", label: "Referrals", icon: Send },
    { key: "model", label: "Model Insights", icon: HeartPulse },
];
export function AppShell({ view, onViewChange, children, }) {
    const { user, logout, referrals } = useStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pendingReferrals = referrals.filter((r) => r.status !== "admitted").length;
    const nav = (<nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ key, label, icon: Icon }) => {
            const active = view === key;
            return (<button key={key} onClick={() => {
                    onViewChange(key);
                    setMobileOpen(false);
                }} className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}>
            <Icon className={cn("size-5 shrink-0", active && "text-primary")}/>
            <span className="flex-1 text-left">{label}</span>
            {key === "referrals" && pendingReferrals > 0 && (<span className="flex size-5 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-critical-foreground">
                {pendingReferrals}
              </span>)}
          </button>);
        })}
    </nav>);
    const sidebarBody = (<div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse className="size-5"/>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Sentinel</p>
          <p className="text-xs text-muted-foreground">Maternal Triage</p>
        </div>
      </div>
      {nav}
      {user && (<div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {FACILITY_LABELS[user.facility]}
          </p>
          <Button variant="outline" size="sm" onClick={logout} className="mt-3 w-full justify-center gap-2">
            <LogOut className="size-4"/> Sign out
          </Button>
        </div>)}
    </div>);
    return (<div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-dvh">{sidebarBody}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (<div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar">
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
              <X className="size-5"/>
            </button>
            {sidebarBody}
          </div>
        </div>)}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar view={view} onMenu={() => setMobileOpen(true)}/>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>);
}
function TopBar({ view, onMenu }) {
    const { syncState, pendingSync, syncBatch, toggleConnectivity } = useStore();
    const [syncing, setSyncing] = useState(false);
    const online = syncState === "online";
    const title = NAV.find((n) => n.key === view)?.label ?? "Dashboard";
    async function handleSync() {
        setSyncing(true);
        try {
            await syncBatch();
        }
        finally {
            setSyncing(false);
        }
    }
    return (<header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
      <button aria-label="Open menu" onClick={onMenu} className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden">
        <Menu className="size-5"/>
      </button>
      <h1 className="flex-1 truncate text-lg font-semibold tracking-tight">{title}</h1>

      {pendingSync > 0 && (<Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="gap-2">
          <Cloud className="size-4"/>
          {syncing ? "Syncing…" : `Sync ${pendingSync}`}
        </Button>)}

      <button onClick={toggleConnectivity} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", online
            ? "border-safe/30 bg-safe-muted text-safe"
            : "border-moderate/30 bg-moderate-muted text-moderate")} title="Toggle connectivity (demo)">
        {online ? <Cloud className="size-3.5"/> : <CloudOff className="size-3.5"/>}
        {online ? "Online" : "Offline"}
      </button>
    </header>);
}
