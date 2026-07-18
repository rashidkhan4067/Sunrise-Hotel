import type { Booking } from "../types"
import { ClipboardList, Clock, LogIn, LogOut, XCircle, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/stat-card"

interface SummaryCardsProps {
  bookings: Booking[]
}

export function SummaryCards({ bookings }: SummaryCardsProps) {
  const total = bookings.length
  const pending = bookings.filter(b => b.status === "PENDING" || b.status === "CONFIRMED").length
  const checkedIn = bookings.filter(b => b.status === "CHECKED_IN").length
  const checkedOut = bookings.filter(b => b.status === "CHECKED_OUT").length
  const cancelled = bookings.filter(b => b.status === "CANCELLED").length

  const stats = [
    {
      title: "Total Bookings",
      value: total,
      icon: ClipboardList,
      badgeText: "Live",
      footerText: "All system reservations",
      footerSubtext: "Active & completed bookings",
    },
    {
      title: "Pending / Confirmed",
      value: pending,
      icon: Clock,
      badgeText: "Upcoming",
      footerText: "Awaiting arrival",
      footerSubtext: "Confirmed guest stays",
    },
    {
      title: "Checked In",
      value: checkedIn,
      icon: LogIn,
      badgeText: "In-House",
      footerText: "Currently occupying",
      footerIcon: TrendingUp,
      footerSubtext: "Active room occupants",
    },
    {
      title: "Checked Out",
      value: checkedOut,
      icon: LogOut,
      badgeText: "Completed",
      footerText: "Fulfilled stays",
      footerSubtext: "Departure queue completed",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: XCircle,
      badgeText: "Cancelled",
      footerText: "Voided reservations",
      footerSubtext: "Released room availability",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {stats.map((s) => (
        <StatCard
          key={s.title}
          title={s.title}
          value={s.value}
          icon={s.icon}
          badgeText={s.badgeText}
          footerText={s.footerText}
          footerIcon={s.footerIcon}
          footerSubtext={s.footerSubtext}
        />
      ))}
    </div>
  )
}
