"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import type { ReportFilters, ReportRow, ReportSummary } from "../types"

const DEFAULT_SUMMARY: ReportSummary = {
  totalBookings: 0,
  totalRevenue: 0.0,
  occupancyRate: 0.0,
  activeGuests: 0,
  financials: {
    adr: 0,
    revpar: 0,
    alos: 0,
    roomRevenue: 0,
    taxRevenue: 0
  }
}

export function useReportData(filters: ReportFilters) {
  const { getToken } = useAuth()
  const [rows, setRows] = useState<ReportRow[]>([])
  const [summary, setSummary] = useState<ReportSummary>(DEFAULT_SUMMARY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      try {
        const token = await getToken()
        if (!token) return

        const params = new URLSearchParams({
          report_type: filters.reportType,
          date_range: filters.dateRange,
          status: filters.status,
          room_type: filters.roomType,
        })

        if (filters.dateRange === "custom") {
          if (filters.startDate) params.append("start_date", filters.startDate)
          if (filters.endDate) params.append("end_date", filters.endDate)
        }

        const [reportRes, finRes] = await Promise.all([
          apiClient.get<any>(`/reports/data/?${params.toString()}`, token).catch(() => null),
          apiClient.get<any>(`/reports/financials/?${params.toString()}`, token).catch(() => null)
        ])

        if (active) {
          const loadedSummary = reportRes?.summary || DEFAULT_SUMMARY
          if (finRes?.kpis) {
            loadedSummary.financials = {
              adr: finRes.kpis.adr || 0,
              revpar: finRes.kpis.revpar || 0,
              alos: finRes.kpis.alos || 0,
              roomRevenue: finRes.kpis.roomRevenue || 0,
              taxRevenue: finRes.kpis.taxRevenue || 0
            }
          }
          if (finRes?.forecasting) {
            loadedSummary.forecasting = finRes.forecasting
          }
          if (finRes?.occupancyByRoomType) {
            loadedSummary.occupancyByRoomType = finRes.occupancyByRoomType
          }
          setRows(reportRes?.rows || [])
          setSummary(loadedSummary)
        }
      } catch (err: any) {
        if (active) {
          toast.error(err.message || "An error occurred while loading reports.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [filters, getToken])

  return { rows, summary, loading }
}
