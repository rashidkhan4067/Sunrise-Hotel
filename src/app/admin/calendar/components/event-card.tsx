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
  const guestName = booking.guest_details?.full_name || "Guest"

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "group relative p-2.5 rounded-xl border bg-card hover:bg-accent/30 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col gap-1.5 text-left border-l-4 overflow-hidden select-none",
        isCheckIn
          ? "border-l-emerald-500 border-border/60 hover:border-emerald-500/50"
          : "border-l-blue-500 border-border/60 hover:border-blue-500/50"
      )}
    >
      {/* Top Header: Room Number & Compact IN/OUT Pill Badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 font-bold text-xs text-foreground">
          <Bed className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">Room {roomNumber}</span>
        </div>

        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider flex items-center gap-1 shrink-0 uppercase",
            isCheckIn
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
          )}
        >
          {isCheckIn ? <LogIn className="h-3 w-3 shrink-0" /> : <LogOut className="h-3 w-3 shrink-0" />}
          <span>{isCheckIn ? "IN" : "OUT"}</span>
        </span>
      </div>

      {/* Guest Name */}
      <div className="text-xs font-bold text-foreground truncate" title={guestName}>
        {guestName}
      </div>

      {/* Footer: Status & Occupants */}
      <div className="pt-1.5 flex items-center justify-between border-t border-border/40 text-[10px]">
        <BookingStatusBadge status={booking.status} className="text-[9px] px-1.5 py-0 border-none font-semibold" />
        <span className="text-muted-foreground font-mono font-medium shrink-0">
          {booking.adults}A{booking.children > 0 ? ` ${booking.children}C` : ""}
        </span>
      </div>
    </div>
  )
}
