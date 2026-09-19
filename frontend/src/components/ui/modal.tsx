

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** "center" for a dialog, "right"/"bottom" for a drawer */
  side?: "center" | "right" | "bottom"
  /** max-width for centered dialogs */
  size?: "md" | "lg" | "xl"
  title?: string
  description?: string
  className?: string
}

const SIZE_MAP: Record<"md" | "lg" | "xl", string> = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export function Modal({
  open,
  onClose,
  children,
  side = "center",
  size = "md",
  title,
  description,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const panel =
    side === "center"
      ? `left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] ${SIZE_MAP[size]} -translate-x-1/2 -translate-y-1/2 rounded-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95`
      : side === "right"
        ? "right-0 top-0 h-full w-full max-w-md rounded-l-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
        : "bottom-0 left-0 w-full max-h-[90vh] rounded-t-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Close overlay"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in-0"
      />
      <div
        data-state="open"
        className={cn(
          "absolute flex flex-col overflow-hidden border border-border bg-card shadow-xl",
          panel,
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-1">
              {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  )
}
