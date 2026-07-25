import { LifeBuoy, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import type { SupportTicket } from "../types"

interface SupportKpiBarProps {
  tickets: SupportTicket[]
}

export function SupportKpiBar({ tickets }: SupportKpiBarProps) {
  const totalCount = tickets.length
  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length
  const urgentCount = tickets.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
          <LifeBuoy className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Tickets</p>
          <p className="text-lg font-black text-foreground">{totalCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <Clock className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Pending</p>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400">{openCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="size-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
          <AlertCircle className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Urgent / High</p>
          <p className="text-lg font-black text-rose-600 dark:text-rose-400">{urgentCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <CheckCircle2 className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Resolved</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
        </div>
      </div>
    </div>
  )
}
