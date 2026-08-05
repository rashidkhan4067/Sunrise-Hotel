"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { IS_DEMO_MODE, DEMO_ROOMS, DEMO_BOOKINGS, demoDelay } from "@/lib/demo-data"

export interface DashboardSummary {
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  cleaningRooms: number
  maintenanceRooms: number
  todayCheckInsCount: number
  todayCheckOutsCount: number
  activeBookingsCount: number
}

export interface TodayCheckInOut {
  guestName: string
  roomNumber: string
  status: string
}

export interface RecentBooking {
  bookingId: string
  guestName: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: string
  totalPrice?: number
}

export interface UpcomingArrival {
  guestName: string
  roomNumber: string
  arrivalDate: string
  nights: number
}

export interface RecentActivity {
  type: string
  message: string
  timestamp: string
}

export interface OccupancyTrendPoint {
  month: string
  occupancy: number
}

export interface DashboardPayload {
  summary: DashboardSummary
  todayCheckIns: TodayCheckInOut[]
  todayCheckOuts: TodayCheckInOut[]
  recentBookings: RecentBooking[]
  upcomingArrivals: UpcomingArrival[]
  recentActivity: RecentActivity[]
  occupancyTrend: OccupancyTrendPoint[]
}

function buildDemoDashboard(): DashboardPayload {
  const today = new Date().toISOString().split("T")[0]
  const checkedIn = DEMO_BOOKINGS.filter((b) => b.status === "CHECKED_IN")
  const confirmed = DEMO_BOOKINGS.filter((b) => b.status === "CONFIRMED")
  const todayIns = DEMO_BOOKINGS.filter((b) => b.check_in === today)
  const todayOuts = DEMO_BOOKINGS.filter((b) => b.check_out === today && b.status === "CHECKED_IN")

  return {
    summary: {
      totalRooms: DEMO_ROOMS.length,
      occupiedRooms: DEMO_ROOMS.filter((r) => r.status === "OCCUPIED").length,
      availableRooms: DEMO_ROOMS.filter((r) => r.status === "AVAILABLE").length,
      cleaningRooms: DEMO_ROOMS.filter((r) => r.status === "CLEANING").length,
      maintenanceRooms: DEMO_ROOMS.filter((r) => r.status === "MAINTENANCE").length,
      todayCheckInsCount: todayIns.length || 3,
      todayCheckOutsCount: todayOuts.length || 2,
      activeBookingsCount: checkedIn.length + confirmed.length,
    },
    todayCheckIns: (todayIns.length > 0 ? todayIns : DEMO_BOOKINGS.filter(b => b.status === "CONFIRMED").slice(0, 3)).map((b) => ({
      guestName: b.guest_details?.full_name ?? "Guest",
      roomNumber: b.room_details?.room_number ?? "",
      status: b.status,
    })),
    todayCheckOuts: checkedIn.slice(0, 2).map((b) => ({
      guestName: b.guest_details?.full_name ?? "Guest",
      roomNumber: b.room_details?.room_number ?? "",
      status: b.status,
    })),
    recentBookings: DEMO_BOOKINGS.slice(0, 6).map((b) => ({
      bookingId: b.booking_id,
      guestName: b.guest_details?.full_name ?? "Guest",
      roomNumber: b.room_details?.room_number ?? "",
      checkIn: b.check_in,
      checkOut: b.check_out,
      status: b.status,
      totalPrice: Number(b.total_price),
    })),
    upcomingArrivals: confirmed.slice(0, 4).map((b) => {
      const nights = Math.ceil(
        (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        guestName: b.guest_details?.full_name ?? "Guest",
        roomNumber: b.room_details?.room_number ?? "",
        arrivalDate: b.check_in,
        nights,
      }
    }),
    recentActivity: [
      { type: "CHECK_IN", message: "Zubair Shah checked in to Room 301", timestamp: "2026-08-01T13:00:00Z" },
      { type: "BOOKING", message: "New booking created for Rabia Tahir — Room 601", timestamp: "2026-08-04T08:00:00Z" },
      { type: "CHECK_OUT", message: "Nadia Rehman checked out from Room 201", timestamp: "2026-07-30T12:00:00Z" },
      { type: "CANCEL", message: "Booking BK-0008 cancelled by Hina Qureshi", timestamp: "2026-07-12T11:00:00Z" },
      { type: "MAINTENANCE", message: "Room 403 marked for maintenance", timestamp: "2026-08-03T09:00:00Z" },
    ],
    occupancyTrend: [
      { month: "Mar", occupancy: 54 },
      { month: "Apr", occupancy: 61 },
      { month: "May", occupancy: 68 },
      { month: "Jun", occupancy: 73 },
      { month: "Jul", occupancy: 79 },
      { month: "Aug", occupancy: 82 },
    ],
  }
}

export function useDashboardData() {
  const { getToken } = useAuth()
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let intervalId: any = null

    async function loadData(isInitial = false) {
      if (isInitial) {
        setLoading(true)
      }
      try {
        let payload: DashboardPayload

        if (IS_DEMO_MODE) {
          payload = await demoDelay(buildDemoDashboard(), 500)
        } else {
          const token = await getToken()
          if (!token) return
          payload = await apiClient.get<DashboardPayload>("/reports/dashboard/", token)
        }

        if (active) {
          setData(payload)
          setError(null)
        }
      } catch (err: any) {
        if (active && isInitial) {
          setError(err.message || "An error occurred.")
          toast.error(err.message || "Failed to load dashboard statistics.")
        }
      } finally {
        if (active && isInitial) {
          setLoading(false)
        }
      }
    }

    // Initial load
    loadData(true)

    // Poll every 5 seconds for real-time live data (disabled in demo mode)
    if (!IS_DEMO_MODE) {
      intervalId = setInterval(() => {
        loadData(false)
      }, 5000)
    }

    return () => {
      active = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [getToken])

  return { data, loading, error }
}
