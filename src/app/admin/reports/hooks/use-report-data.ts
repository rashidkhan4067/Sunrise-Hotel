"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { IS_DEMO_MODE, DEMO_REPORT_SUMMARY, DEMO_REPORT_ROWS, demoDelay } from "@/lib/demo-data"
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
        if (IS_DEMO_MODE) {
          await demoDelay(null, 300)
          if (!active) return

          // Adjust demo rows based on filters
          let filteredRows = [...DEMO_REPORT_ROWS]
          if (filters.dateRange === "today") {
            filteredRows = filteredRows.slice(-1)
          } else if (filters.dateRange === "this_week") {
            filteredRows = filteredRows.slice(-7)
          }

          if (filters.roomType !== "all") {
            filteredRows = filteredRows.map(r => ({
              ...r,
              bookings: Math.max(1, Math.round(r.bookings * 0.3)),
              revenue: Math.round(r.revenue * 0.3),
              checkIns: Math.max(1, Math.round(r.checkIns * 0.3)),
              checkOuts: Math.max(1, Math.round(r.checkOuts * 0.3)),
            }))
          }

          const calculatedTotalRevenue = filteredRows.reduce((acc, r) => acc + r.revenue, 0)
          const calculatedTotalBookings = filteredRows.reduce((acc, r) => acc + r.bookings, 0)
          const avgOccupancy = filteredRows.length
            ? Math.round(filteredRows.reduce((acc, r) => acc + r.occupancyPct, 0) / filteredRows.length * 10) / 10
            : DEMO_REPORT_SUMMARY.occupancyRate

          setRows(filteredRows)
          setSummary({
            ...DEMO_REPORT_SUMMARY,
            totalRevenue: calculatedTotalRevenue || DEMO_REPORT_SUMMARY.totalRevenue,
            totalBookings: calculatedTotalBookings || DEMO_REPORT_SUMMARY.totalBookings,
            occupancyRate: avgOccupancy,
          })
          return
        }

        const token = await getToken()
        if (!token) {
          setRows(DEMO_REPORT_ROWS)
          setSummary(DEMO_REPORT_SUMMARY)
          return
        }

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
          const loadedSummary = reportRes?.summary || DEMO_REPORT_SUMMARY
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
          setRows(reportRes?.rows && reportRes.rows.length > 0 ? reportRes.rows : DEMO_REPORT_ROWS)
          setSummary(loadedSummary)
        }
      } catch (err: any) {
        if (active) {
          setRows(DEMO_REPORT_ROWS)
          setSummary(DEMO_REPORT_SUMMARY)
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
