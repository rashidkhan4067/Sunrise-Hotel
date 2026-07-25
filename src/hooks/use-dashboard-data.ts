"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

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
        const token = await getToken()
        if (!token) return

        const payload = await apiClient.get<DashboardPayload>("/reports/dashboard/", token)
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

    // Poll every 5 seconds for real-time live data
    intervalId = setInterval(() => {
      loadData(false)
    }, 5000)

    return () => {
      active = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [getToken])

  return { data, loading, error }
}
