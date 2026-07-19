import type { Booking } from "@/features/bookings/types"

export interface CalendarEvent {
  id: string
  booking: Booking
  date: Date
  kind: "checkin" | "checkout"
}

export const STATUS_CONFIG: Record<Booking["status"], { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmed", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  CHECKED_IN: { label: "Checked In", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-600" },
  CHECKED_OUT: { label: "Checked Out", bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  CANCELLED: { label: "Cancelled", bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
}
