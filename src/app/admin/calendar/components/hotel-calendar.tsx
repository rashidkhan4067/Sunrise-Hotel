"use client"

import { useEffect, useMemo, useState } from "react"
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
} from "@/features/bookings/api"
import type { Booking } from "@/features/bookings/types"
import { BookingFormDialog } from "@/features/bookings/components/booking-dialogs"
import type { BookingFormValues } from "@/features/bookings/schemas"
import { FilterBar } from "@/components/shared"
import { BaseLayout } from "@/components/layouts/base-layout"
import { toast } from "sonner"
import { isAdminRole } from "@/lib/utils"

import type { CalendarEvent } from "../types"
import { BookingDrawer } from "./booking-drawer"
import { CalendarViews } from "./calendar-views"

// ─── Events Parser Helper ───────────────────
function toEvents(bookings: Booking[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const b of bookings) {
    events.push({
      id: `${b.booking_id}-ci`,
      booking: b,
      date: new Date(b.check_in),
      kind: "checkin",
    })
    events.push({
      id: `${b.booking_id}-co`,
      booking: b,
      date: new Date(b.check_out),
      kind: "checkout",
    })
  }
  return events
}

export function HotelCalendar() {
  const { getToken, role: authRole } = useAuth()
  const role = authRole || "org:member"
  const isAdmin = isAdminRole(role)

  // Data Loading
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation & Views
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Drawer & Form Dialog States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // ─── Fetch Bookings ──────────────────────────
  async function loadBookings() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const data = await fetchBookings(token!)
      setBookings(Array.isArray(data) ? data : (data as any)?.results || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Filtered Bookings & Events ──────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        b.booking_id.toLowerCase().includes(q) ||
        (b.guest_details?.full_name && b.guest_details.full_name.toLowerCase().includes(q)) ||
        (b.room_details?.room_number && b.room_details.room_number.toLowerCase().includes(q))

      const matchesStatus = statusFilter === "all" || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const events = useMemo(() => toEvents(filteredBookings), [filteredBookings])

  // ─── Actions ──────────────────────────────────
  async function handleCheckIn() {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await checkInBooking(selectedBooking.booking_id, token!)
      toast.success("Guest checked in successfully")
      setDrawerOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Check-in failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await checkOutBooking(selectedBooking.booking_id, token!)
      toast.success("Guest checked out successfully")
      setDrawerOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Check-out failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await cancelBooking(selectedBooking.booking_id, token!)
      toast.success("Booking cancelled successfully")
      setDrawerOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Cancellation failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await deleteBooking(selectedBooking.booking_id, token!)
      toast.success("Booking deleted successfully")
      setDrawerOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Delete failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddBooking(values: BookingFormValues) {
    const token = await getToken()
    await createBooking(values, token!)
    toast.success("Booking created successfully")
    await loadBookings()
  }

  async function handleEditBooking(values: BookingFormValues) {
    if (!selectedBooking) return
    const token = await getToken()
    await updateBooking(selectedBooking.booking_id, values, token!)
    toast.success("Booking updated successfully")
    setDrawerOpen(false)
    await loadBookings()
  }

  // ─── Navigation Handlers ──────────────────────
  function navigate(direction: "prev" | "next") {
    if (viewMode === "day") {
      setCurrentDate(direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1))
    } else if (viewMode === "week") {
      setCurrentDate(direction === "prev" ? subDays(currentDate, 7) : addDays(currentDate, 7))
    } else {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    }
  }

  function getActiveDateRangeLabel() {
    if (viewMode === "day") {
      return format(currentDate, "MMMM d, yyyy")
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate)
      const end = addDays(start, 6)
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "MMMM d")} – ${format(end, "d, yyyy")}`
      }
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }

  const getDayEvents = (date: Date) => events.filter((e) => isSameDay(e.date, date))

  function openDetail(booking: Booking) {
    setSelectedBooking(booking)
    setDrawerOpen(true)
  }

  return (
    <BaseLayout
      title="Booking Calendar"
      description="Live view of guest check-ins and check-outs across all rooms."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            disabled={loading}
            className="cursor-pointer gap-2 h-9"
            title="Refresh bookings"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="cursor-pointer gap-2 h-9"
          >
            <Plus className="h-4 w-4" /> New Booking
          </Button>
        </div>
      }
    >
      <div className="px-4 lg:px-6 flex flex-col gap-6">
        {/* Full horizontal Filter bar */}
        <FilterBar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search by Guest, Room, Booking ID...",
            label: "Search Calendar",
          }}
          filters={[
            {
              id: "status",
              label: "Booking Status",
              value: statusFilter,
              onValueChange: setStatusFilter,
              options: [
                { label: "All Statuses", value: "all" },
                { label: "Pending", value: "PENDING" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Checked In", value: "CHECKED_IN" },
                { label: "Checked Out", value: "CHECKED_OUT" },
                { label: "Cancelled", value: "CANCELLED" },
              ],
            },
          ]}
          onReset={() => {
            setSearch("")
            setStatusFilter("all")
          }}
          isFiltered={search !== "" || statusFilter !== "all"}
        />

        {/* ── Calendar Grid Container ── */}
        <div className="border border-border/50 bg-gradient-to-b from-card to-card/95 rounded-xl overflow-hidden flex flex-col shadow-2xs hover:shadow-xs transition-all duration-300">
          {/* Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border/30 bg-muted/10">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("prev")}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("next")}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="cursor-pointer"
              >
                Today
              </Button>
              <h2 className="text-sm font-semibold text-foreground ml-2">
                {getActiveDateRangeLabel()}
              </h2>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-border p-0.5 bg-background">
              {(["day", "week", "month"] as const).map((view) => (
                <Button
                  key={view}
                  variant={viewMode === view ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(view)}
                  className={cn(
                    "h-7 text-xs px-3 capitalize cursor-pointer rounded-md",
                    viewMode === view ? "shadow-xs" : ""
                  )}
                >
                  {view}
                </Button>
              ))}
            </div>
          </div>

          {/* ── View Renderers ── */}
          {loading ? (
            <div className="h-[450px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading calendar events...
              </div>
            </div>
          ) : error ? (
            <div className="h-[400px] flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto opacity-75" />
                <p className="text-sm text-muted-foreground font-medium">{error}</p>
                <Button onClick={loadBookings} size="sm" className="cursor-pointer">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <CalendarViews
              viewMode={viewMode}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              getDayEvents={getDayEvents}
              openDetail={openDetail}
            />
          )}
        </div>

        {/* ── Booking Detail Side Drawer ── */}
        <BookingDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          booking={selectedBooking}
          actionLoading={actionLoading}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onEdit={() => setEditOpen(true)}
          isAdmin={isAdmin}
        />

        {/* ── Add Booking Dialog ── */}
        <BookingFormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mode="add"
          getToken={getToken}
          onSubmit={handleAddBooking}
        />

        {/* ── Edit Booking Dialog ── */}
        <BookingFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          booking={selectedBooking}
          getToken={getToken}
          onSubmit={handleEditBooking}
        />
      </div>
    </BaseLayout>
  )
}
