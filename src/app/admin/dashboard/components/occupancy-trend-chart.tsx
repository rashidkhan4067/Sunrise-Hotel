"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import type { DashboardPayload } from "@/hooks/use-dashboard-data"

const chartConfig = {
  occupancy: {
    label: "Occupancy Rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const tooltipStyle = {
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08)",
}

export function OccupancyTrendChart({ trend }: { trend: DashboardPayload["occupancyTrend"] }) {
  if (!trend || trend.length === 0) return null

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          Monthly Occupancy Trend
        </CardTitle>
        <CardDescription className="text-xs">
          Average room occupancy rate (%) over last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/80" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fontWeight: 550 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 9, fontWeight: 550 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(v: number | undefined) => [`${v ?? 0}%`, "Occupancy Rate"]}
                contentStyle={tooltipStyle}
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOccupancy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
