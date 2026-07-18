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

        const data = await apiClient.get<any>(`/reports/data/?${params.toString()}`, token)
        if (data && active) {
          setRows(data.rows || [])
          setSummary(data.summary || DEFAULT_SUMMARY)
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
