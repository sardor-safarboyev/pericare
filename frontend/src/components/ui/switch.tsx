

import { cn } from "@/lib/utils"

export function Switch({
  checked,
  onCheckedChange,
  className,
  id,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  className?: string
  id?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
        checked ? "bg-primary" : "bg-input",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
