"use client"

import { useState } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileDown, FileText, ClipboardList, DollarSign, Activity, TrendingUp, ShieldCheck, BarChart3, Coins, Clock } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { formatCurrency, downloadCSV } from "@/utils/format"
import { useAppStore } from "@/store/use-app-store"
import { ReportFilterBar } from "./components/report-filter-bar"
import { ReportTable } from "./components/report-table"
import { ReportCharts } from "./components/report-charts"
import { AuditLogsTab } from "./components/audit-logs-tab"
import { useReportData } from "./hooks/use-report-data"
import type { ReportFilters } from "./types"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("analytics")
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

  const adrVal = summary.financials?.adr ?? 0
  const revparVal = summary.financials?.revpar ?? 0
  const alosVal = summary.financials?.alos ?? 0

  return (
    <BaseLayout
      title="Reports & Compliance"
      description="Analyze hotel operations, booking performance, ADR/RevPAR financials, and audit trails."
      actions={actions}
    >
      <div className="px-4 lg:px-6 space-y-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-auto border border-border/50 mb-4">
            <TabsTrigger value="analytics" className="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border-0 shadow-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>Operational Reports</span>
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border-0 shadow-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Security Audit Trail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[115px] rounded-2xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Total Revenue",
                    value: formatCurrency(summary.totalRevenue),
                    icon: DollarSign,
                    badgeText: `ADR ${formatCurrency(adrVal)}`,
                    badgeClassName: "text-[10px] font-semibold px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full",
                    footerText: `Average Daily Rate (ADR): ${formatCurrency(adrVal)}`,
                    footerIcon: TrendingUp,
                    footerSubtext: "Confirmed & checked-out stay revenue",
                  },
                  {
                    title: "RevPAR",
                    value: formatCurrency(revparVal),
                    icon: Coins,
                    badgeText: "Yield Efficiency",
                    badgeClassName: "text-[10px] font-semibold px-2 py-0.5 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full",
                    footerText: "Revenue Per Available Room",
                    footerIcon: TrendingUp,
                    footerSubtext: "Total property inventory performance",
                  },
                  {
                    title: "Occupancy Rate",
                    value: `${summary.occupancyRate}%`,
                    icon: Activity,
                    badgeText: "Utilization",
                    footerText: "Rooms Occupied vs. Total Inventory",
                    footerIcon: TrendingUp,
                    footerSubtext: "Average across selected period",
                  },
                  {
                    title: "Total Reservations",
                    value: summary.totalBookings,
                    icon: ClipboardList,
                    badgeText: `${alosVal} nights ALOS`,
                    badgeClassName: "text-[10px] font-semibold px-2 py-0.5 border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full",
                    footerText: `Average Length of Stay: ${alosVal} nights`,
                    footerIcon: Clock,
                    footerSubtext: "All status bookings in period",
                  },
                ].map((c) => (
                  <StatCard key={c.title} {...c} />
                ))}
              </div>
            )}

            {/* Revenue Forecasting & Room Category Occupancy Card (Phase 13) */}
            {summary.forecasting && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border border-border/50 shadow-2xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span>30-Day Revenue Forecasting</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Projected forward revenue from confirmed & checked-in reservations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Projected 30-Day Revenue</span>
                      <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(summary.forecasting.projectedRevenueNext30Days)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span>Forward Reservations Count:</span>
                      <span className="font-bold text-foreground">{summary.forecasting.forwardBookingsCount} Bookings</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 shadow-2xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Occupancy by Room Category</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live occupancy rate breakdown across physical room categories.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5 pt-2">
                    {summary.occupancyByRoomType?.map((cat) => (
                      <div key={cat.roomType} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="capitalize">{cat.roomType.toLowerCase()} Rooms</span>
                          <span className="font-mono text-muted-foreground">
                            {cat.occupiedRooms}/{cat.totalRooms} ({cat.occupancyRate}%)
                          </span>
                        </div>
                        <Progress value={cat.occupancyRate} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            <ReportFilterBar filters={filters} onChange={setFilters} />
            <ReportCharts rows={rows} loading={loading} />
            <ReportTable rows={rows} loading={loading} />
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-4">
            <AuditLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  )
}
