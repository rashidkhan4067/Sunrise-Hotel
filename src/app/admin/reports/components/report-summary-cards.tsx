"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, DollarSign, Activity, Users, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { formatCurrency } from "@/utils/format"
import type { ReportSummary } from "../types"

interface Props {
  summary: ReportSummary
  loading: boolean
}

export function ReportSummaryCards({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Bookings",
      value: summary.totalBookings,
      icon: ClipboardList,
      badgeText: "Period",
      footerText: "Within selected period",
      footerSubtext: "All status reservations",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
      badgeText: "+12.5%",
      footerText: "Trending up this period",
      footerIcon: TrendingUp,
      footerSubtext: "Confirmed + checked-out stays",
    },
    {
      title: "Occupancy Rate",
      value: `${summary.occupancyRate}%`,
      icon: Activity,
      badgeText: "+4.5%",
      footerText: "Steady performance increase",
      footerIcon: TrendingUp,
      footerSubtext: "Average across selected period",
    },
    {
      title: "Active Guests",
      value: summary.activeGuests,
      icon: Users,
      badgeText: "Profiles",
      footerText: "Registered guest profiles",
      footerSubtext: "Verified system accounts",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <StatCard
          key={c.title}
          title={c.title}
          value={c.value}
          icon={c.icon}
          badgeText={c.badgeText}
          footerText={c.footerText}
          footerIcon={c.footerIcon}
          footerSubtext={c.footerSubtext}
        />
      ))}
    </div>
  )
}
