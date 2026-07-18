"use client"

import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bed,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Key,
  Brush,
  Wrench,
  Plus,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { DashboardPayload, TodayCheckInOut, RecentBooking, UpcomingArrival, RecentActivity } from "@/hooks/use-dashboard-data"



import { StatCard } from "@/components/stat-card"
import { TrendingUp } from "lucide-react"

// ─── 1. SUMMARY CARDS ───────────────────────────────────────────

export function SummaryCards({ summary }: { summary: DashboardPayload["summary"] }) {
  const cards = [
    {
      title: "Total Rooms",
      value: summary.totalRooms,
      icon: Bed,
      badgeText: "100%",
      badgeIcon: TrendingUp,
      footerText: "Full catalog index",
      footerIcon: TrendingUp,
      footerSubtext: "Active room inventory",
    },
    {
      title: "Occupied Rooms",
      value: summary.occupiedRooms,
      icon: Bed,
      badgeText: "+12.5%",
      badgeIcon: TrendingUp,
      footerText: "Trending up this month",
      footerIcon: TrendingUp,
      footerSubtext: "Currently checked in guests",
    },
    {
      title: "Available Rooms",
      value: summary.availableRooms,
      icon: Key,
      badgeText: "Ready",
      footerText: "Clean & inspected",
      footerIcon: TrendingUp,
      footerSubtext: "Available for instant booking",
    },
    {
      title: "Today's Check-ins",
      value: summary.todayCheckInsCount,
      icon: ArrowUpRight,
      badgeText: "Today",
      footerText: "Scheduled arrivals",
      footerIcon: TrendingUp,
      footerSubtext: "Front desk check-in queue",
    },
    {
      title: "Today's Check-outs",
      value: summary.todayCheckOutsCount,
      icon: ArrowDownRight,
      badgeText: "Today",
      footerText: "Scheduled departures",
      footerSubtext: "Pending room release & cleaning",
    },
    {
      title: "Active Bookings",
      value: summary.activeBookingsCount,
      icon: ClipboardList,
      badgeText: "+4.5%",
      badgeIcon: TrendingUp,
      footerText: "Steady performance increase",
      footerIcon: TrendingUp,
      footerSubtext: "In-house + confirmed stays",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}

// ─── 2. TODAY'S OPERATIONS ─────────────────────────────────────

export function TodayOperations({
  checkIns,
  checkOuts,
}: {
  checkIns: TodayCheckInOut[]
  checkOuts: TodayCheckInOut[]
}) {
  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Today's Operations</CardTitle>
        <CardDescription className="text-xs">Monitor arrivals and departures for today</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Today's Check-ins */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            Check-ins ({checkIns.length})
          </h3>
          {checkIns.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg bg-muted/5">
              No check-ins today.
            </p>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {checkIns.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs">
                  <div>
                    <p className="font-medium text-foreground">{item.guestName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Room {item.roomNumber}</p>
                  </div>
                  <BookingStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Check-outs */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownRight className="h-3.5 w-3.5 text-blue-500" />
            Check-outs ({checkOuts.length})
          </h3>
          {checkOuts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg bg-muted/5">
              No check-outs today.
            </p>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {checkOuts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs">
                  <div>
                    <p className="font-medium text-foreground">{item.guestName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Room {item.roomNumber}</p>
                  </div>
                  <BookingStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 3. ROOM STATUS SUMMARY ────────────────────────────────────

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
  const statuses = [
    { label: "Available", value: available, icon: Key, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Occupied", value: occupied, icon: Bed, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Cleaning", value: cleaning, icon: Brush, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Maintenance", value: maintenance, icon: Wrench, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ]

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Room Status Summary</CardTitle>
        <CardDescription className="text-xs">Live physical room index status</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {statuses.map(({ label, value, icon: Icon, className }) => (
          <div key={label} className="p-3 border border-border rounded-lg bg-card/40 flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${className} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── 4. RECENT BOOKINGS ────────────────────────────────────────

export function RecentBookings({ bookings }: { bookings: RecentBooking[] }) {
  const navigate = useNavigate()

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold">Recent Bookings</CardTitle>
          <CardDescription className="text-xs">Latest reservations logged in database</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/admin/bookings")}>
          View All Bookings
        </Button>
      </CardHeader>
      <CardContent className="p-0 border-t border-border">
        {bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No bookings recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">ID</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Guest</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Room</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Check-in</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Check-out</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.bookingId} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-xs font-medium font-mono text-muted-foreground whitespace-nowrap">{b.bookingId}</TableCell>
                    <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">{b.guestName}</TableCell>
                    <TableCell className="text-xs text-foreground whitespace-nowrap">Room {b.roomNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{b.checkIn}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{b.checkOut}</TableCell>
                    <TableCell className="text-xs text-right whitespace-nowrap">
                      <BookingStatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 5. UPCOMING ARRIVALS ──────────────────────────────────────

export function UpcomingArrivals({ arrivals }: { arrivals: UpcomingArrival[] }) {
  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Upcoming Arrivals</CardTitle>
        <CardDescription className="text-xs">Guests arriving in the next few days</CardDescription>
      </CardHeader>
      <CardContent className="p-0 border-t border-border">
        {arrivals.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No upcoming arrivals scheduled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Guest</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Room</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Arrival Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">Nights</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arrivals.map((arr, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">{arr.guestName}</TableCell>
                    <TableCell className="text-xs text-foreground whitespace-nowrap">Room {arr.roomNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{arr.arrivalDate}</TableCell>
                    <TableCell className="text-xs text-right font-medium text-foreground whitespace-nowrap">{arr.nights} nights</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 6. RECENT ACTIVITY ────────────────────────────────────────

export function RecentActivity({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        <CardDescription className="text-xs">Chronological operational events log</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No recent activity recorded.
          </div>
        ) : (
          <div className="relative border-l border-border pl-4 ml-2 space-y-4 max-h-[300px] overflow-y-auto">
            {activities.map((act, idx) => (
              <div key={idx} className="relative space-y-1">
                {/* Dot */}
                <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-card bg-primary ring-2 ring-background" />
                <p className="text-xs text-foreground font-medium leading-normal">{act.message}</p>
                <p className="text-[10px] text-muted-foreground">{act.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 7. QUICK ACTIONS ──────────────────────────────────────────

export function QuickActions({
  onNewBooking,
  onAddGuest,
  onAddRoom,
}: {
  onNewBooking: () => void
  onAddGuest: () => void
  onAddRoom: () => void
}) {
  const navigate = useNavigate()

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        <CardDescription className="text-xs">Hotel administration shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2" onClick={onNewBooking}>
          <Plus className="h-3.5 w-3.5" />
          Create Booking
        </Button>
        <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2" onClick={onAddGuest}>
          <Plus className="h-3.5 w-3.5" />
          Add Guest
        </Button>
        <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2" onClick={onAddRoom}>
          <Plus className="h-3.5 w-3.5" />
          Add Room
        </Button>
        <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2" onClick={() => navigate("/admin/calendar")}>
          <Calendar className="h-3.5 w-3.5" />
          Open Calendar
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── 8. OCCUPANCY TREND LINE CHART ─────────────────────────────

const chartConfig = {
  occupancy: {
    label: "Occupancy Rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  boxShadow: "none",
}

export function OccupancyTrendChart({ trend }: { trend: DashboardPayload["occupancyTrend"] }) {
  if (!trend || trend.length === 0) return null

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Monthly Occupancy Trend</CardTitle>
        <CardDescription className="text-xs">
          Average room occupancy rate (%) over last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="month"
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
                cursor={{ stroke: "var(--border)" }}
              />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
