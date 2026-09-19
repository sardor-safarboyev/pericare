import { cn } from "@/lib/utils"
import { RISK_LABELS, riskClasses } from "@/lib/clinical"
import type { RiskZone } from "@/lib/types"

export function RiskBadge({
  zone,
  className,
  label,
  showDot = true,
}: {
  zone: RiskZone
  className?: string
  label?: string
  showDot?: boolean
}) {
  const c = riskClasses(zone)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        c.badge,
        className,
      )}
    >
      {showDot && <span className={cn("size-2 rounded-full", c.dot)} aria-hidden />}
      {label ?? RISK_LABELS[zone]}
    </span>
  )
}
