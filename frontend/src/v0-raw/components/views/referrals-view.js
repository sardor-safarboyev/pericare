"use client";
import { useState } from "react";
import { Ambulance, BedDouble, CheckCircle2, Clock, Droplet, Pill, Plus, Syringe, } from "lucide-react";
import { useStore } from "@/lib/store";
import { REFERRAL_ACTION_LABELS, REFERRAL_STATUS_LABELS, SYNDROME_LABELS, formatRelativeTime, riskClasses, } from "@/lib/clinical";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { RiskBadge } from "@/components/risk-badge";
import { cn } from "@/lib/utils";
const STATUS_FLOW = ["pending", "in_transit", "admitted"];
const ACTION_ICONS = {
    magnesium_sulfate: Syringe,
    anti_hypertensive: Pill,
    icu_bed_requested: BedDouble,
    ambulance_dispatched: Ambulance,
};
export function ReferralsView() {
    const { referrals } = useStore();
    const [actionFor, setActionFor] = useState(null);
    const sorted = referrals
        .slice()
        .sort((a, b) => STATUS_FLOW.indexOf(a.status) - STATUS_FLOW.indexOf(b.status));
    return (<div className="mx-auto flex max-w-5xl flex-col gap-4">
      {sorted.length === 0 && (<div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-20 text-center">
          <Droplet className="size-6 text-muted-foreground"/>
          <p className="text-sm font-medium">No active referrals</p>
          <p className="text-xs text-muted-foreground">
            Escalate a critical triage result to open a referral.
          </p>
        </div>)}

      {sorted.map((r) => (<ReferralCard key={r.id} referral={r} onAddAction={() => setActionFor(r)}/>))}

      <ActionModal referral={actionFor} onClose={() => setActionFor(null)}/>
    </div>);
}
function ReferralCard({ referral, onAddAction, }) {
    const { advanceReferral } = useStore();
    const rc = riskClasses(referral.riskZone);
    const stageIndex = STATUS_FLOW.indexOf(referral.status);
    const nextStatus = STATUS_FLOW[stageIndex + 1];
    return (<Card className="overflow-hidden">
      <div className={cn("flex flex-wrap items-center gap-3 p-4", rc.bg)}>
        <span className={cn("flex size-10 items-center justify-center rounded-full", rc.solid)}>
          {initials(referral.patientName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{referral.patientName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {SYNDROME_LABELS[referral.syndrome]} · opened {formatRelativeTime(referral.createdAt)}
          </p>
        </div>
        <RiskBadge zone={referral.riskZone}/>
      </div>

      <CardContent className="flex flex-col gap-4 p-4">
        {/* Status stepper */}
        <div className="flex items-center gap-2">
          {STATUS_FLOW.map((status, i) => {
            const done = i <= stageIndex;
            return (<div key={status} className="flex flex-1 items-center gap-2 last:flex-none">
                <div className="flex items-center gap-1.5">
                  <span className={cn("flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors", done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {done ? <CheckCircle2 className="size-3.5"/> : i + 1}
                  </span>
                  <span className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                    {REFERRAL_STATUS_LABELS[status]}
                  </span>
                </div>
                {i < STATUS_FLOW.length - 1 && (<div className={cn("h-px flex-1", i < stageIndex ? "bg-primary" : "bg-border")}/>)}
              </div>);
        })}
        </div>

        {/* Actions timeline */}
        {referral.actions.length > 0 && (<div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            {referral.actions.map((a) => {
                const Icon = ACTION_ICONS[a.type];
                return (<div key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-3.5"/>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{REFERRAL_ACTION_LABELS[a.type]}</p>
                    <p className="text-xs text-muted-foreground">{a.note}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(a.timestamp)}
                  </span>
                </div>);
            })}
          </div>)}

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5"/> SLA {referral.slaMinutes}m
          </span>
          <Button variant="outline" size="sm" onClick={onAddAction} className="gap-1.5">
            <Plus className="size-3.5"/> Log action
          </Button>
          {nextStatus && (<Button size="sm" onClick={() => advanceReferral(referral.id, nextStatus)} className="gap-1.5">
              Mark {REFERRAL_STATUS_LABELS[nextStatus]}
            </Button>)}
        </div>
      </CardContent>
    </Card>);
}
function ActionModal({ referral, onClose, }) {
    const { addReferralAction } = useStore();
    const [type, setType] = useState("magnesium_sulfate");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    if (!referral)
        return null;
    async function submit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await addReferralAction(referral.id, type, note || REFERRAL_ACTION_LABELS[type]);
            setNote("");
            setType("magnesium_sulfate");
            onClose();
        }
        finally {
            setSaving(false);
        }
    }
    return (<Modal open={!!referral} onClose={onClose} title={`Log action · ${referral.patientName}`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="action-type">Intervention</Label>
          <Select id="action-type" value={type} onChange={(e) => setType(e.target.value)}>
            {Object.keys(REFERRAL_ACTION_LABELS).map((t) => (<option key={t} value={t}>
                {REFERRAL_ACTION_LABELS[t]}
              </option>))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note">Clinical note</Label>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dose, time, responsible clinician…" rows={3}/>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Plus className="size-4"/>
            {saving ? "Logging…" : "Log action"}
          </Button>
        </div>
      </form>
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
