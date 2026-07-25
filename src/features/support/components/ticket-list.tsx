import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LifeBuoy, Search, User, Bed, Clock } from "lucide-react"
import { TicketStatusBadge, TicketPriorityBadge } from "./ticket-status-badge"
import type { SupportTicket } from "../types"

interface TicketListProps {
  tickets: SupportTicket[]
  selectedTicket: SupportTicket | null
  onSelectTicket: (ticket: SupportTicket) => void
  loading?: boolean
  role: "guest" | "staff" | "admin"
}

export function TicketList({
  tickets,
  selectedTicket,
  onSelectTicket,
  loading,
  role,
}: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      t.ticket_id.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.guest_name && t.guest_name.toLowerCase().includes(q)) ||
      (t.room_number && t.room_number.toLowerCase().includes(q))
    )
  })

  const isStaff = role === "staff" || role === "admin"

  return (
    <Card className="border-border/80 shadow-md bg-card/80 backdrop-blur-md flex flex-col h-[620px] w-full overflow-hidden transition-all">
      <CardHeader className="p-3.5 border-b border-border/80 space-y-2.5 bg-muted/20">
        <CardTitle className="text-sm font-extrabold flex items-center justify-between tracking-tight">
          <span className="flex items-center gap-2">
            <LifeBuoy className="size-4 text-primary" />
            {isStaff ? "Support Inbox Feed" : "My Active Inquiries"}
          </span>
          <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground border border-border/50">
            {filteredTickets.length}
          </span>
        </CardTitle>

        {isStaff && (
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Room #, Guest, Ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-card border-border/70 focus-visible:ring-primary font-medium"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-2.5 overflow-y-auto space-y-2 flex-1">
        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground animate-pulse flex flex-col items-center gap-2">
            <Clock className="size-5 text-muted-foreground/60" />
            Syncing tickets inbox...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground italic border border-dashed border-border/60 rounded-xl p-5 bg-muted/10">
            No matching support tickets found.
          </div>
        ) : (
          filteredTickets.map((t) => {
            const unreadCount = isStaff ? (t.unread_count_staff || 0) : (t.unread_count_guest || 0)
            const hasUnread = unreadCount > 0
            const isSelected = selectedTicket?.id === t.id

            return (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-2 relative overflow-hidden ${
                  isSelected
                    ? "bg-primary/10 border-primary/50 shadow-sm border-l-4 border-l-primary"
                    : "bg-card hover:bg-muted/30 border-border/60 hover:border-border/90 hover:shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{t.ticket_id}</span>
                    {hasUnread && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-destructive text-white shadow-2xs animate-pulse">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isStaff && <TicketPriorityBadge priority={t.priority} />}
                    <TicketStatusBadge status={t.status} />
                  </div>
                </div>

                <h4 className="font-bold text-foreground line-clamp-1 text-xs tracking-tight">{t.subject}</h4>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/40 text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <User className="size-3 text-primary shrink-0" />
                    <span className="truncate max-w-[110px]">{t.guest_name || t.guest_email || "Guest"}</span>
                  </span>
                  {t.room_number && (
                    <span className="flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Bed className="size-3" />
                      Room {t.room_number}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
