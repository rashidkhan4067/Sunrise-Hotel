// ─── Filter Types ───────────────────────────────────────────────

export type DateRangePreset =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "custom"

export type BookingStatus = "all" | "confirmed" | "checked_in" | "checked_out" | "pending" | "cancelled"

export type RoomType = "all" | "single" | "double" | "suite" | "deluxe"

export type ReportType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "revenue"
  | "occupancy"
  | "booking"

export interface ReportFilters {
  reportType: ReportType
  dateRange: DateRangePreset
  startDate: string
  endDate: string
  status: BookingStatus
  roomType: RoomType
}

// ─── Report Row ─────────────────────────────────────────────────

export interface ReportRow {
  date: string           // e.g. "2026-07-01", "Week 28", "July 2026", "2026"
  bookings: number
  revenue: number
  checkIns: number
  checkOuts: number
  occupancyPct: number   // 0–100
  avgStay: number        // nights
}

// ─── Summary ────────────────────────────────────────────────────

export interface FinancialKPIs {
  adr: number
  revpar: number
  alos: number
  roomRevenue: number
  taxRevenue: number
}

export interface ForecastingData {
  projectedRevenueNext30Days: number
  forwardBookingsCount: number
}

export interface OccupancyByRoomTypeData {
  roomType: string
  totalRooms: number
  occupiedRooms: number
  occupancyRate: number
}

export interface ReportSummary {
  totalBookings: number
  totalRevenue: number
  occupancyRate: number  // 0–100
  activeGuests: number
  financials?: FinancialKPIs
  forecasting?: ForecastingData
  occupancyByRoomType?: OccupancyByRoomTypeData[]
}
