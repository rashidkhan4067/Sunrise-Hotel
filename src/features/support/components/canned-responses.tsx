import { Zap } from "lucide-react"
import type { CannedResponse } from "../types"

export const DEFAULT_CANNED_RESPONSES: CannedResponse[] = [
  { label: "🧹 Housekeeping Dispatched", text: "Housekeeping staff has been notified and is on their way to your room with fresh supplies." },
  { label: "🛠️ Maintenance En Route", text: "Our engineering technician has been dispatched to inspect and resolve your issue shortly." },
  { label: "🍽️ Order Prepared", text: "Your room service order is being prepared by our kitchen team and will be delivered shortly." },
  { label: "📄 Billing Updated", text: "Your stay folio balance has been updated. Please review your statement or let us know if you have questions." },
]

interface CannedResponsesProps {
  onSelect: (text: string) => void
  disabled?: boolean
}

export function CannedResponses({ onSelect, disabled }: CannedResponsesProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
      <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0 flex items-center gap-1">
        <Zap className="size-3 text-amber-500" /> Templates:
      </span>
      {DEFAULT_CANNED_RESPONSES.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.text)}
          disabled={disabled}
          className="text-[11px] font-medium bg-muted/50 hover:bg-primary/15 border border-border/60 hover:border-primary/40 rounded-full px-2.5 py-1 text-foreground transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
