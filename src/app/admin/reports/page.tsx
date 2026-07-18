"use client"

import { useState } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { FileDown, FileText } from "lucide-react"
import { ReportSummaryCards } from "./components/report-summary-cards"
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

  const handleExportCSV = () => {
    if (!rows.length) return
    const headers = ["Date", "Bookings", "Revenue ($)", "Check-ins", "Check-outs", "Occupancy (%)", "Avg Stay (nights)"]
    const csvRows = rows.map((r) => [
      r.date,
      r.bookings,
      r.revenue.toFixed(2),
      r.checkIns,
      r.checkOuts,
      r.occupancyPct,
      r.avgStay.toFixed(1),
    ])
    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hotel-report-${filters.dateRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
        <ReportSummaryCards summary={summary} loading={loading} />
        <ReportFilterBar filters={filters} onChange={setFilters} />
        <ReportCharts rows={rows} loading={loading} />
        <ReportTable rows={rows} loading={loading} />
      </div>
    </BaseLayout>
  )
}
