"use client"

import { Bed, LogIn, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { BookingStatusBadge } from "@/components/shared"
import type { CalendarEvent } from "../types"

interface EventCardProps {
  ev: CalendarEvent
  onClick: () => void
}

export function EventCard({ ev, onClick }: EventCardProps) {
  const isCheckIn = ev.kind === "checkin"
  const booking = ev.booking
  const roomNumber = booking.room_details?.room_number || "—"
  const guestName = booking.guest_details?.full_name || "—"

  const theme = isCheckIn
    ? {
        border: "border-border/60 hover:border-border/80 dark:border-border/40",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none hover:bg-emerald-500/10",
        text: "In"
      }
    : {
        border: "border-border/60 hover:border-border/80 dark:border-border/40",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none hover:bg-blue-500/10",
        text: "Out"
      }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "p-3 rounded-xl border bg-gradient-to-b from-card to-card/90 hover:from-card/95 hover:to-card/85 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-2 text-left",
        theme.border
      )}
    >
      {/* Top row: Room info and Direction label */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
          <Bed className="h-3.5 w-3.5 text-muted-foreground/75" />
          Room {roomNumber}
        </span>
        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 select-none", theme.badge)}>
          {isCheckIn ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
          {theme.text}
        </span>
      </div>

      {/* Guest Name on a single line */}
      <div className="text-xs font-semibold text-foreground/90 truncate leading-relaxed" title={guestName}>
        {guestName}
      </div>

      {/* Status Badge & Guest Count */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/40">
        <BookingStatusBadge status={booking.status} className="text-[9px] px-1.5 py-0 border-none font-semibold" />
        <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">
          {booking.adults}A{booking.children > 0 ? ` ${booking.children}C` : ""}
        </span>
      </div>
    </div>
  )
}


