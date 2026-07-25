import { Badge } from "@/components/ui/badge"
import type { TicketStatus, TicketPriority } from "../types"

interface TicketStatusBadgeProps {
  status: TicketStatus | string
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  switch (status) {
    case "OPEN":
      return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">Open</Badge>
    case "IN_PROGRESS":
      return <Badge variant="outline" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30">In Progress</Badge>
    case "RESOLVED":
      return <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Resolved</Badge>
    default:
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Closed</Badge>
  }
}

interface TicketPriorityBadgeProps {
  priority: TicketPriority | string
}

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  switch (priority) {
    case "URGENT":
      return <Badge className="bg-destructive text-destructive-foreground animate-pulse font-extrabold">Urgent</Badge>
    case "HIGH":
      return <Badge variant="outline" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold">High</Badge>
    case "MEDIUM":
      return <Badge variant="outline" className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30">Medium</Badge>
    default:
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Low</Badge>
  }
}
