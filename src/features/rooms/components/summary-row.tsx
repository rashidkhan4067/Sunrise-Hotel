import type { Room } from "../types"
import { StatCard } from "@/components/stat-card"
import { Bed, CheckCircle2, KeyRound, Sparkles, Wrench, TrendingUp } from "lucide-react"

interface SummaryData {
  total: number
  available: number
  occupied: number
  cleaning: number
  maintenance: number
}

interface SummaryRowProps {
  rooms?: Room[]
  summary?: SummaryData
}

export function SummaryRow({ rooms = [], summary }: SummaryRowProps) {
  const data = summary || {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "AVAILABLE").length,
    occupied: rooms.filter((r) => r.status === "OCCUPIED").length,
    cleaning: rooms.filter((r) => r.status === "CLEANING").length,
    maintenance: rooms.filter((r) => r.status === "MAINTENANCE").length,
  }

  const items = [
    {
      title: "Total Rooms",
      value: data.total,
      icon: Bed,
      badgeText: "100%",
      footerText: "Full catalog index",
      footerSubtext: "Active room inventory",
    },
    {
      title: "Available",
      value: data.available,
      icon: CheckCircle2,
      badgeText: "Ready",
      footerText: "Clean & inspected",
      footerIcon: TrendingUp,
      footerSubtext: "Available for booking",
    },
    {
      title: "Occupied",
      value: data.occupied,
      icon: KeyRound,
      badgeText: "In-House",
      footerText: "Currently checked in",
      footerIcon: TrendingUp,
      footerSubtext: "Occupied guest rooms",
    },
    {
      title: "Cleaning",
      value: data.cleaning,
      icon: Sparkles,
      badgeText: "Turnover",
      footerText: "Housekeeping queue",
      footerSubtext: "Pending maid release",
    },
    {
      title: "Maintenance",
      value: data.maintenance,
      icon: Wrench,
      badgeText: "Service",
      footerText: "Out of order",
      footerSubtext: "Engineering inspection",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          badgeText={item.badgeText}
          footerText={item.footerText}
          footerIcon={item.footerIcon}
          footerSubtext={item.footerSubtext}
        />
      ))}
    </div>
  )
}
