/**
 * Shared Status Badge Components
 *
 * Centralized status badge definitions for Booking and Room statuses.
 * Import from here instead of duplicating in every feature module.
 *
 * Usage:
 *   import { BookingStatusBadge, RoomStatusBadge } from "@/components/shared/status-badges"
 */

import { Badge } from "@/components/ui/badge"

// ─── Booking Status ──────────────────────────────────────────────

export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none hover:bg-amber-500/15",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-none hover:bg-blue-500/15",
  },
  CHECKED_IN: {
    label: "Checked In",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none hover:bg-emerald-500/15",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-none hover:bg-slate-500/15",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-none hover:bg-rose-500/15",
  },
}

interface BookingStatusBadgeProps {
  status: string
  className?: string
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = BOOKING_STATUS_CONFIG[status as BookingStatus]
  if (!config) {
    return (
      <Badge className={`border-none text-muted-foreground bg-muted ${className ?? ""}`}>
        {status}
      </Badge>
    )
  }
  return (
    <Badge className={`${config.className} ${className ?? ""}`}>
      {config.label}
    </Badge>
  )
}

// ─── Room Status ─────────────────────────────────────────────────

export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE"

const ROOM_STATUS_CONFIG: Record<RoomStatus, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none hover:bg-emerald-500/15",
  },
  OCCUPIED: {
    label: "Occupied",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-none hover:bg-blue-500/15",
  },
  CLEANING: {
    label: "Cleaning",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none hover:bg-amber-500/15",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-none hover:bg-rose-500/15",
  },
}

interface RoomStatusBadgeProps {
  status: string
  className?: string
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const config = ROOM_STATUS_CONFIG[status as RoomStatus]
  if (!config) {
    return (
      <Badge className={`border-none text-muted-foreground bg-muted ${className ?? ""}`}>
        {status}
      </Badge>
    )
  }
  return (
    <Badge className={`${config.className} ${className ?? ""}`}>
      {config.label}
    </Badge>
  )
}
