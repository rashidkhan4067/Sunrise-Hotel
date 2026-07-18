"use client"

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { ReportRow } from "../types"

interface Props {
  rows: ReportRow[]
  loading: boolean
}

// ─── Chart theme configurations ─────────────────────────────────

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  pct: {
    label: "Occupancy %",
    color: "var(--primary)",
  },
} satisfies ChartConfig

// ─── Tooltip style shared ───────────────────────────────────────

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  boxShadow: "none",
}

function ChartSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[180px] w-full rounded-lg" />
    </div>
  )
}

// Smart revenue formatter for Y-axis ticks
function formatYAxisRevenue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value}`
}

// ─── Monthly Revenue Line Chart ─────────────────────────────────

function RevenueLineChart({ rows }: { rows: ReportRow[] }) {
  // Directly map the aggregated rows. Shows daily, weekly, monthly, or yearly revenue dynamically.
  const data = rows.map((r) => ({
    name: r.date,
    revenue: r.revenue,
  }))

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[180px] text-xs text-muted-foreground">
        No data for selected period
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisRevenue}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, "Revenue"]}
            contentStyle={tooltipStyle}
            cursor={{ stroke: "hsl(var(--border))" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// ─── Room Occupancy Bar Chart ───────────────────────────────────

function OccupancyBarChart({ rows }: { rows: ReportRow[] }) {
  // Directly map the aggregated rows. Shows daily, weekly, monthly, or yearly occupancy dynamically.
  const data = rows.map((r) => ({
    name: r.date,
    pct: r.occupancyPct,
  }))

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[180px] text-xs text-muted-foreground">
        No data for selected period
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(v: number | undefined) => [`${v ?? 0}%`, "Occupancy"]}
            contentStyle={tooltipStyle}
            cursor={{ fill: "var(--muted)", opacity: 0.15 }}
          />
          <Bar
            dataKey="pct"
            fill="var(--primary)"
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// ─── Combined Charts Section ────────────────────────────────────

export function ReportCharts({ rows, loading }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Monthly Revenue */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
          <CardDescription className="text-xs">
            Revenue performance over selected report periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <ChartSkeleton /> : <RevenueLineChart rows={rows} />}
        </CardContent>
      </Card>

      {/* Chart 2: Room Occupancy */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Room Occupancy</CardTitle>
          <CardDescription className="text-xs">
            Average occupancy rate (%) across report periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <ChartSkeleton /> : <OccupancyBarChart rows={rows} />}
        </CardContent>
      </Card>
    </div>
  )
}
