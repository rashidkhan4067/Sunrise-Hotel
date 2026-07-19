"use client"

import { useState } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { FileDown, FileText, ClipboardList, DollarSign, Activity, Users, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { formatCurrency, downloadCSV } from "@/utils/format"
import { useAppStore } from "@/store/use-app-store"
import { ReportFilterBar } from "./components/report-filter-bar"
import { ReportTable } from "./components/report-table"
import { ReportCharts } from "./components/report-charts"
import { useReportData } from "./hooks/use-report-data"
import type { ReportFilters } from "./types"

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "daily",
    dateRange: "this_month",
    startDate: "",
    endDate: "",
    status: "all",
    roomType: "all",
  })

  const { rows, summary, loading } = useReportData(filters)
  const currency = useAppStore((state) => state.hotelInfo.currency)

  const handleExportCSV = () => {
    if (!rows.length) return
    downloadCSV(
      ["Date", "Bookings", `Revenue (${currency})`, "Check-ins", "Check-outs", "Occupancy (%)", "Avg Stay (nights)"],
      rows.map((r) => [
        r.date,
        r.bookings,
        r.revenue.toFixed(2),
        r.checkIns,
        r.checkOuts,
        r.occupancyPct,
        r.avgStay.toFixed(1),
      ]),
      `hotel-report-${filters.dateRange}`
    )
  }

  const handleExportPDF = () => {
    window.print()
  }

  const actions = (
    <>
      <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={loading || !rows.length}>
        <FileDown className="mr-1.5 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={loading}>
        <FileText className="mr-1.5 h-4 w-4" />
        Export PDF
      </Button>
    </>
  )

  return (
    <BaseLayout
      title="Reports"
      description="Analyze hotel operations and booking performance."
      actions={actions}
    >
      <div className="px-4 lg:px-6 space-y-6 pb-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[100px] rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
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
                footerText: "Confirmed + checked-out stays",
                footerIcon: TrendingUp,
                footerSubtext: `Total for selected period`,
              },
              {
                title: "Occupancy Rate",
                value: `${summary.occupancyRate}%`,
                icon: Activity,
                footerText: "Average across selected period",
                footerIcon: TrendingUp,
                footerSubtext: "Rooms occupied vs. total",
              },
              {
                title: "Active Guests",
                value: summary.activeGuests,
                icon: Users,
                badgeText: "Profiles",
                footerText: "Registered guest profiles",
                footerSubtext: "Verified system accounts",
              },
            ].map((c) => (
              <StatCard key={c.title} {...c} />
            ))}
          </div>
        )}
        <ReportFilterBar filters={filters} onChange={setFilters} />
        <ReportCharts rows={rows} loading={loading} />
        <ReportTable rows={rows} loading={loading} />
      </div>
    </BaseLayout>
  )
}
