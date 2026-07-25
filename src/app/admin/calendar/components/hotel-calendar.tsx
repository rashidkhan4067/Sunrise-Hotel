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
import { fetchRooms } from "@/features/rooms/api"
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
import { CalendarTimelineView } from "./calendar-timeline-view"

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
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation & Views
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "timeline">("week")

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Drawer & Form Dialog States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // ─── Fetch Bookings & Rooms ──────────────────────────
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) return
      const [bData, rData] = await Promise.all([
        fetchBookings(token),
        fetchRooms(token).catch(() => []),
      ])
      setBookings(Array.isArray(bData) ? bData : (bData as any)?.results || [])
      setRooms(Array.isArray(rData) ? rData : (rData as any)?.results || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [getToken])

  // ─── Filtered Bookings & Events ────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        b.guest_details?.full_name?.toLowerCase().includes(q) ||
        b.room_details?.room_number?.toLowerCase().includes(q) ||
        b.booking_id.toLowerCase().includes(q)

      const matchStatus =
        statusFilter === "all" || b.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchSearch && matchStatus
    })
  }, [bookings, search, statusFilter])

  const events = useMemo(() => toEvents(filteredBookings), [filteredBookings])

  const getDayEvents = (date: Date) => {
    return events.filter((e) => isSameDay(e.date, date))
  }

  // ─── Navigation Handlers ───────────────────
  const handlePrev = () => {
    if (viewMode === "day") setCurrentDate((d) => subDays(d, 1))
    else if (viewMode === "week") setCurrentDate((d) => subDays(d, 7))
    else setCurrentDate((d) => subMonths(d, 1))
  }

  const handleNext = () => {
    if (viewMode === "day") setCurrentDate((d) => addDays(d, 1))
    else if (viewMode === "week") setCurrentDate((d) => addDays(d, 7))
    else setCurrentDate((d) => addMonths(d, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // ─── Drawer Open Helper ────────────────────
  const openDetail = (bookingId: string) => {
    const found = bookings.find((b) => b.booking_id === bookingId)
    if (found) {
      setSelectedBooking(found)
      setDrawerOpen(true)
    }
  }

  // ─── Action Handlers ───────────────────────
  async function handleCheckIn() {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await checkInBooking(selectedBooking.booking_id, token!)
      toast.success(`Checked in ${selectedBooking.guest_details?.full_name || "guest"}`)
      setDrawerOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to check in")
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
      toast.success(`Checked out ${selectedBooking.guest_details?.full_name || "guest"}`)
      setDrawerOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to check out")
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
      toast.success("Reservation cancelled")
      setDrawerOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel reservation")
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
      toast.success("Reservation deleted")
      setDrawerOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete reservation")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddBooking(values: BookingFormValues) {
    try {
      const token = await getToken()
      await createBooking(values, token!)
      toast.success("New reservation created successfully!")
      setAddOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create reservation")
      throw err
    }
  }

  async function handleEditBooking(values: BookingFormValues) {
    if (!selectedBooking) return
    try {
      const token = await getToken()
      await updateBooking(selectedBooking.booking_id, values, token!)
      toast.success("Reservation updated successfully!")
      setEditOpen(false)
      setDrawerOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update reservation")
      throw err
    }
  }

  // ─── Header Title Generator ────────────────
  const headerTitle = useMemo(() => {
    if (viewMode === "day") {
      return format(currentDate, "MMMM d, yyyy")
    }
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = addDays(start, 6)
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
    }
    if (viewMode === "timeline") {
      return "Room Stay Timeline Grid"
    }
    return format(currentDate, "MMMM yyyy")
  }, [currentDate, viewMode])

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={loadData}
        disabled={loading}
        className="h-8 text-xs cursor-pointer gap-1.5"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        Refresh
      </Button>
      <Button
        size="sm"
        onClick={() => setAddOpen(true)}
        className="h-8 text-xs cursor-pointer bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        New Reservation
      </Button>
    </div>
  )

  return (
    <BaseLayout
      title="Reservation Calendar"
      description="Visual schedule of check-ins, check-outs, and stay timelines across hotel room inventory."
      actions={actions}
    >
      <div className="px-4 lg:px-6 space-y-4 pb-8">
        {/* ── Filter Bar ── */}
        <FilterBar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search guest name, room # or booking ID...",
          }}
          filters={[
            {
              id: "status",
              value: statusFilter,
              onValueChange: setStatusFilter,
              options: [
                { label: "All Statuses", value: "all" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Checked In", value: "checked_in" },
                { label: "Checked Out", value: "checked_out" },
                { label: "Pending", value: "pending" },
                { label: "Cancelled", value: "cancelled" },
              ],
            },
          ]}
        />

        {/* ── Calendar Toolbar & Main Container ── */}
        <div className="border border-border/60 bg-gradient-to-b from-card via-card to-card/95 rounded-2xl p-5 shadow-sm space-y-5">
          {/* Top Control Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-4">
            
            {/* Title & Navigation Controls */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-8 text-xs font-bold cursor-pointer rounded-lg border-border/60 hover:bg-accent"
              >
                Today
              </Button>

              <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/40">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="h-7 w-7 rounded-md cursor-pointer hover:bg-background shadow-none"
                  aria-label="Previous period"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-7 w-7 rounded-md cursor-pointer hover:bg-background shadow-none"
                  aria-label="Next period"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-base font-extrabold text-foreground ml-1 tracking-tight">
                {headerTitle}
              </h2>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center rounded-xl bg-muted/50 p-1 border border-border/50 shadow-2xs">
              {(["day", "week", "month", "timeline"] as const).map((view) => (
                <Button
                  key={view}
                  variant={viewMode === view ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(view)}
                  className={cn(
                    "h-7 text-xs px-3.5 capitalize cursor-pointer rounded-lg font-bold transition-all duration-200",
                    viewMode === view 
                      ? "shadow-xs bg-background text-foreground ring-1 ring-border/50" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {view === "timeline" ? "Room Grid" : view}
                </Button>
              ))}
            </div>
          </div>

          {/* ── View Renderers ── */}
          {loading ? (
            <div className="h-[450px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading calendar events...
              </div>
            </div>
          ) : error ? (
            <div className="h-[400px] flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto opacity-75" />
                <p className="text-sm text-muted-foreground font-medium">{error}</p>
                <Button onClick={loadData} size="sm" className="cursor-pointer">
                  Retry
                </Button>
              </div>
            </div>
          ) : viewMode === "timeline" ? (
            <CalendarTimelineView
              rooms={rooms}
              bookings={bookings}
              onSelectBooking={(id) => openDetail(id)}
            />
          ) : (
            <CalendarViews
              viewMode={viewMode as "day" | "week" | "month"}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              getDayEvents={getDayEvents}
              openDetail={(b) => openDetail(b.booking_id)}
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
