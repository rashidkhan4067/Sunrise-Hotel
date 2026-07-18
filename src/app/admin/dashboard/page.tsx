"use client"

import { useNavigate } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, UserPlus } from "lucide-react"

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

export default function Page() {
  const navigate = useNavigate()
  const { data, loading } = useDashboardData()

  const handleNewBooking = () => navigate("/admin/bookings?action=new")
  const handleAddGuest = () => navigate("/admin/guests?action=new")
  const handleAddRoom = () => navigate("/admin/rooms?action=new")

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
      {loading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="@container/main px-4 lg:px-6 space-y-6">
          {/* 1. Summary Cards */}
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
              },
              {
                title: "Occupied Rooms",
                value: data.summary.occupiedRooms,
                icon: Bed,
                badgeText: "+12.5%",
                badgeIcon: TrendingUp,
                footerText: "Trending up this month",
                footerIcon: TrendingUp,
                footerSubtext: "Currently checked in guests",
              },
              {
                title: "Today's Check-ins",
                value: data.summary.todayCheckInsCount,
                icon: ArrowUpRight,
                badgeText: "Today",
                footerText: "Scheduled arrivals",
                footerIcon: TrendingUp,
                footerSubtext: "Front desk check-in queue",
              },
              {
                title: "Today's Check-outs",
                value: data.summary.todayCheckOutsCount,
                icon: ArrowDownRight,
                badgeText: "Today",
                footerText: "Scheduled departures",
                footerSubtext: "Pending room release & cleaning",
              },
            ].map((card) => (
              <StatCard key={card.title} {...card} />
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
              />

              {/* Upcoming Arrivals */}
              <UpcomingArrivals arrivals={data.upcomingArrivals} />

              {/* Recent Activity */}
              <RecentActivity activities={data.recentActivity} />
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  )
}
