"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, UserPlus, AlertTriangle, RefreshCw } from "lucide-react"

import { useDashboardData } from "@/hooks/use-dashboard-data"
import { DashboardSkeleton } from "./components/dashboard-skeleton"
import { StatCard } from "@/components/stat-card"
import { Bed, Key, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import {
  TodayOperations,
  RoomStatusSummary,
  RecentBookings,
  UpcomingArrivals,
  RecentActivity,
  QuickActions,
  OccupancyTrendChart,
} from "./components/dashboard-components"
import { CtaBanner } from "@/components/shared"

export default function Page() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = pathname.startsWith("/receptionist") ? "/receptionist" : "/admin"
  const { data, loading, error } = useDashboardData()

  const handleNewBooking = () => navigate(`${prefix}/bookings?action=new`)
  const handleAddGuest = () => navigate(`${prefix}/guests?action=new`)
  const handleAddRoom = () => navigate(`${prefix}/rooms?action=new`)

  return (
    <BaseLayout
      title="Dashboard"
      description="Monitor today's hotel operations and occupancy."
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs gap-1.5"
            onClick={handleAddGuest}
            aria-label="Add new guest"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Guest
          </Button>
          <Button
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={handleNewBooking}
            aria-label="Create new booking"
          >
            <Plus className="h-3.5 w-3.5" />
            New Booking
          </Button>
        </div>
      }
    >
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center px-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Failed to load dashboard</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : data ? (
        <div className="@container/main px-4 lg:px-6 space-y-6">
          {/* Operational Receptionist CTA Banner */}
          <CtaBanner
            id="admin-operations-banner"
            variant="operational"
            title="Front Desk Operations Alert"
            description={`${data.summary.todayCheckInsCount} guest check-ins scheduled today. Access quick reservation entry or receptionist deskbar hotkeys.`}
            actionLabel="Quick Check-In"
            onAction={handleNewBooking}
            secondaryActionLabel="View Calendar"
            onSecondaryAction={() => navigate(`${prefix}/calendar`)}
          />

          {/* 1. Summary Cards — clicking navigates to filtered views */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Available Rooms",
                value: data.summary.availableRooms,
                icon: Key,
                badgeText: "Ready",
                footerText: "Clean & inspected",
                footerIcon: TrendingUp,
                footerSubtext: "Available for instant booking",
                onClick: () => navigate(`${prefix}/rooms?status=available`),
              },
              {
                title: "Occupied Rooms",
                value: data.summary.occupiedRooms,
                icon: Bed,
                footerText: "Currently in-house",
                footerIcon: TrendingUp,
                footerSubtext: "Checked in guests",
                onClick: () => navigate(`${prefix}/rooms?status=occupied`),
              },
              {
                title: "Today's Check-ins",
                value: data.summary.todayCheckInsCount,
                icon: ArrowUpRight,
                badgeText: "Today",
                footerText: "Scheduled arrivals",
                footerIcon: TrendingUp,
                footerSubtext: "Front desk check-in queue",
                onClick: () => navigate(`${prefix}/bookings?status=CHECKED_IN`),
              },
              {
                title: "Today's Check-outs",
                value: data.summary.todayCheckOutsCount,
                icon: ArrowDownRight,
                badgeText: "Today",
                footerText: "Scheduled departures",
                footerSubtext: "Pending room release & cleaning",
                onClick: () => navigate(`${prefix}/bookings?status=CHECKED_OUT`),
              },
            ].map((card) => (
              <div
                key={card.title}
                onClick={card.onClick}
                className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && card.onClick()}
              >
                <StatCard {...card} />
              </div>
            ))}
          </div>

          {/* 2. Main Two-Column Operational Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Operations & Bookings) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Operations */}
              <TodayOperations
                checkIns={data.todayCheckIns}
                checkOuts={data.todayCheckOuts}
              />

              {/* Recent Bookings */}
              <RecentBookings bookings={data.recentBookings} />

              {/* Monthly Occupancy Trend Chart (Optional Single Operational Chart) */}
              <OccupancyTrendChart trend={data.occupancyTrend} />
            </div>

            {/* Right Column (Status, Shortcuts, Arrivals, Event Log) */}
            <div className="space-y-6">
              {/* Room Status Summary */}
              <RoomStatusSummary
                available={data.summary.availableRooms}
                occupied={data.summary.occupiedRooms}
                cleaning={data.summary.cleaningRooms}
                maintenance={data.summary.maintenanceRooms}
              />

              {/* Quick Actions */}
              <QuickActions
                onNewBooking={handleNewBooking}
                onAddGuest={handleAddGuest}
                onAddRoom={handleAddRoom}
                todayCheckIns={data.todayCheckIns}
                todayCheckOuts={data.todayCheckOuts}
                summary={data.summary}
              />

              {/* Upcoming Arrivals */}
              <UpcomingArrivals arrivals={data.upcomingArrivals} />

              {/* Recent Activity */}
              <RecentActivity activities={data.recentActivity} />
            </div>
          </div>
        </div>
      ) : null}
    </BaseLayout>
  )
}
