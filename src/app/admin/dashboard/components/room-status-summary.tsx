"use client"

import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bed, Key, Brush, Wrench, LayoutGrid } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export function RoomStatusSummary({
  available,
  occupied,
  cleaning,
  maintenance,
}: {
  available: number
  occupied: number
  cleaning: number
  maintenance: number
}) {
  const navigate = useNavigate()
  const totalRooms = available + occupied + cleaning + maintenance

  const statuses = [
    { label: "Available", value: available, icon: Key, color: "#10b981", className: "hover:bg-emerald-500/5 hover:border-emerald-500/30", statusKey: "AVAILABLE" },
    { label: "Occupied", value: occupied, icon: Bed, color: "#3b82f6", className: "hover:bg-blue-500/5 hover:border-blue-500/30", statusKey: "OCCUPIED" },
    { label: "Cleaning", value: cleaning, icon: Brush, color: "#f59e0b", className: "hover:bg-amber-500/5 hover:border-amber-500/30", statusKey: "CLEANING" },
    { label: "Maintenance", value: maintenance, icon: Wrench, color: "#f43f5e", className: "hover:bg-rose-500/5 hover:border-rose-500/30", statusKey: "MAINTENANCE" },
  ]

  const chartData = [
    { name: "Available", value: available, color: "#10b981" },
    { name: "Occupied", value: occupied, color: "#3b82f6" },
    { name: "Cleaning", value: cleaning, color: "#f59e0b" },
    { name: "Maintenance", value: maintenance, color: "#f43f5e" },
  ].filter(item => item.value > 0)

  const getPct = (val: number) => {
    return totalRooms > 0 ? `${Math.round((val / totalRooms) * 100)}%` : "0%"
  }

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <LayoutGrid className="h-4 w-4 text-primary" />
          Room Operations Summary
        </CardTitle>
        <CardDescription className="text-xs">Live physical room index and occupancy metrics</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-5 items-center justify-between">
        
        {/* Left Side: Donut Chart */}
        {totalRooms > 0 ? (
          <div className="relative h-[115px] w-[115px] flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v} Rooms`, "Count"]}
                  contentStyle={{
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    padding: "4px 8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Rooms</span>
              <span className="text-base font-extrabold text-foreground leading-none mt-1">{totalRooms}</span>
            </div>
          </div>
        ) : (
          <div className="h-[115px] w-[115px] flex items-center justify-center text-xs text-muted-foreground italic shrink-0">
            No rooms
          </div>
        )}

        {/* Right Side: Operations Progress Bars */}
        <div className="space-y-3 w-full">
          {statuses.map(({ label, value, icon: Icon, color, className, statusKey }) => (
            <div
              key={label}
              onClick={() => navigate(`/admin/rooms?status=${statusKey}`)}
              className={`space-y-1.5 p-2 rounded-lg border border-transparent cursor-pointer transition-all duration-200 ${className}`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  {label}
                </span>
                <span className="font-bold text-foreground">
                  {value}{" "}
                  <span className="text-[10px] text-muted-foreground font-medium ml-1">
                    ({getPct(value)})
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: getPct(value),
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  )
}
