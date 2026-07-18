"use client"

import { useEffect, useMemo, useState } from "react"
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  Plus,
  Bed,
  User,
  X,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
import { toast } from "sonner"

// ─── Constants & Helpers ──────────────────────

const STATUS_CONFIG: Record<Booking["status"], { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmed", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  CHECKED_IN: { label: "Checked In", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-600" },
  CHECKED_OUT: { label: "Checked Out", bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  CANCELLED: { label: "Cancelled", bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
}

interface CalendarEvent {
  id: string
  booking: Booking
  date: Date
  kind: "checkin" | "checkout"
}

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

// ─── Main Component ───────────────────────────

export function HotelCalendar() {
  const { getToken, role: authRole } = useAuth()
  const role = authRole || "org:member"
  const isAdmin = role === "org:admin" || role === "Admin" || role === "ADMIN"

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

  // Delete Confirm Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

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
      setDeleteConfirmOpen(false)
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

  // ─── Day Renderers ────────────────────────────
  const getDayEvents = (date: Date) => events.filter((e) => isSameDay(e.date, date))

  function openDetail(booking: Booking) {
    setSelectedBooking(booking)
    setDrawerOpen(true)
  }

  // Event Card Element (richer guest, room, status)
  function EventCard({ ev }: { ev: CalendarEvent }) {
    const status = STATUS_CONFIG[ev.booking.status]
    const isCheckIn = ev.kind === "checkin"
    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          openDetail(ev.booking)
        }}
        className={cn(
          "p-2.5 rounded-lg border border-border shadow-xs hover:shadow-md transition cursor-pointer flex flex-col gap-1.5 text-left bg-card animate-in fade-in-50 duration-150"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-xs text-foreground truncate">
            {ev.booking.guest_details?.full_name || "—"}
          </span>
          <Badge className={cn("text-[9px] px-1.5 py-0 scale-95 origin-right border-none shrink-0", status?.bg, status?.text)}>
            {status?.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Bed className="h-3.5 w-3.5 text-muted-foreground/75" />
            Room {ev.booking.room_details?.room_number || "—"}
          </span>
          
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isCheckIn ? (
              <>
                <LogIn className="h-3 w-3 text-emerald-500" />
                In
              </>
            ) : (
              <>
                <LogOut className="h-3 w-3 text-blue-500" />
                Out
              </>
            )}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Practical Filters Row ── */}
      <div className="border border-border bg-card p-4 rounded-xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Guest, Room, Booking ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] cursor-pointer">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CHECKED_IN">Checked In</SelectItem>
              <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {(search !== "" || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
              }}
              title="Reset Filters"
              className="cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={loadBookings}
            disabled={loading}
            className="cursor-pointer shrink-0"
            title="Refresh bookings"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="cursor-pointer gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> New Booking
          </Button>
        </div>
      </div>

      {/* ── Calendar Grid Container ── */}
      <div className="border border-border bg-card rounded-xl overflow-hidden flex flex-col shadow-xs">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b flex-wrap bg-muted/10">
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
          <div className="flex-1 overflow-x-auto">
            {/* DAY VIEW */}
            {viewMode === "day" && (
              <div className="min-w-[300px] p-4 bg-background">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-muted-foreground pb-3 border-b">
                  {format(currentDate, "EEEE, MMMM d")}
                </div>
                <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto pr-1">
                  {getDayEvents(currentDate).length > 0 ? (
                    getDayEvents(currentDate).map((ev) => <EventCard key={ev.id} ev={ev} />)
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-12">
                      No check-ins or check-outs scheduled.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === "week" && (
              <div className="min-w-[800px] grid grid-cols-7 divide-x divide-border bg-background">
                {Array.from({ length: 7 }).map((_, i) => {
                  const start = startOfWeek(currentDate)
                  const day = addDays(start, i)
                  const dayEvs = getDayEvents(day)
                  const isDayToday = isToday(day)

                  return (
                    <div key={i} className="flex flex-col min-h-[480px]">
                      {/* Day Header */}
                      <div
                        className={cn(
                          "p-3 text-center border-b bg-muted/15 flex flex-col gap-0.5",
                          isDayToday ? "bg-primary/5 border-b-primary/30" : ""
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {format(day, "eee")}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full mx-auto",
                            isDayToday ? "bg-primary text-primary-foreground text-xs" : ""
                          )}
                        >
                          {format(day, "d")}
                        </span>
                      </div>

                      {/* Day Events Column */}
                      <div className="flex-1 p-2 space-y-2 max-h-[400px] overflow-y-auto">
                        {dayEvs.length > 0 ? (
                          dayEvs.map((ev) => <EventCard key={ev.id} ev={ev} />)
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground/40 italic">Empty</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* MONTH VIEW */}
            {viewMode === "month" && (
              <div className="min-w-[800px] flex flex-col">
                <div className="grid grid-cols-7 border-b divide-x divide-border bg-muted/20">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 divide-x divide-y divide-border border-b bg-background">
                  {(() => {
                    const monthStart = startOfMonth(currentDate)
                    const monthEnd = endOfMonth(currentDate)
                    const calStart = new Date(monthStart)
                    calStart.setDate(calStart.getDate() - monthStart.getDay())
                    const calEnd = new Date(monthEnd)
                    calEnd.setDate(calEnd.getDate() + (6 - monthEnd.getDay()))
                    const days = eachDayOfInterval({ start: calStart, end: calEnd })

                    return days.map((day) => {
                      const dayEvs = getDayEvents(day)
                      const inMonth = isSameMonth(day, currentDate)
                      const isDayToday = isToday(day)

                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "min-h-[90px] p-1.5 flex flex-col justify-between transition-colors",
                            inMonth ? "hover:bg-muted/15" : "bg-muted/10 opacity-60",
                            isDayToday ? "bg-primary/5" : ""
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={cn(
                                "text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full",
                                isDayToday ? "bg-primary text-primary-foreground text-[10px]" : "text-foreground"
                              )}
                            >
                              {format(day, "d")}
                            </span>
                          </div>

                          <div className="space-y-1 mt-1 max-h-[60px] overflow-y-auto">
                            {dayEvs.map((ev) => {
                              const config = STATUS_CONFIG[ev.booking.status]
                              return (
                                <button
                                  key={ev.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openDetail(ev.booking)
                                  }}
                                  className={cn(
                                    "w-full text-left text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 truncate",
                                    config ? config.dot : "bg-primary"
                                  )}
                                >
                                  {ev.booking.room_details?.room_number || "—"} · {ev.booking.guest_details?.full_name?.split(" ")[0]}
                                </button>
                              )}
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Booking Detail Side Drawer ── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          {selectedBooking && (
            <>
              <SheetHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <Badge className={cn("text-xs font-bold border-none", STATUS_CONFIG[selectedBooking.status]?.bg, STATUS_CONFIG[selectedBooking.status]?.text)}>
                    {STATUS_CONFIG[selectedBooking.status]?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">#{selectedBooking.booking_id}</span>
                </div>
                <SheetTitle className="text-lg font-bold text-foreground pt-2">
                  {selectedBooking.guest_details?.full_name || "Guest Reservation"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Quick action drawer to manage check-ins, check-outs, or cancellations.
                </SheetDescription>
              </SheetHeader>

              {/* Booking & Guest Info details list */}
              <div className="space-y-6 py-6">
                {/* Guest Profile Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Guest Contact
                  </h3>
                  <div className="rounded-lg border border-border p-3 space-y-2.5 bg-muted/15 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-semibold text-foreground">{selectedBooking.guest_details?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone Number</span>
                      <span className="font-medium text-foreground">{selectedBooking.guest_details?.phone_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Address</span>
                      <span className="font-medium text-foreground">{selectedBooking.guest_details?.email || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Stays & Pricing Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Bed className="h-4 w-4" /> Booking Details
                  </h3>
                  <div className="rounded-lg border border-border p-3 space-y-2.5 bg-muted/15 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Assigned</span>
                      <span className="font-semibold text-foreground">
                        Room {selectedBooking.room_details?.room_number} ({selectedBooking.room_details?.room_type})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-In Date</span>
                      <span className="font-medium text-foreground">{selectedBooking.check_in}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-Out Date</span>
                      <span className="font-medium text-foreground">{selectedBooking.check_out}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Guests</span>
                      <span className="font-medium text-foreground">
                        {selectedBooking.adults} Adults {selectedBooking.children > 0 ? `, ${selectedBooking.children} Children` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted-foreground font-semibold">Total Price</span>
                      <span className="font-bold text-sm text-foreground">${Number(selectedBooking.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Sheet Footer */}
              <SheetFooter className="border-t border-border pt-4 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  {/* Check In Action */}
                  {(selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED") && (
                    <Button
                      onClick={handleCheckIn}
                      disabled={actionLoading}
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Check-In
                    </Button>
                  )}

                  {/* Check Out Action */}
                  {selectedBooking.status === "CHECKED_IN" && (
                    <Button
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white gap-1"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                      Check-Out
                    </Button>
                  )}

                  {/* Edit action */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditOpen(true)
                    }}
                    disabled={actionLoading}
                    className="cursor-pointer gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Details
                  </Button>

                  {/* Cancel Action */}
                  {(selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED") && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      Cancel Booking
                    </Button>
                  )}

                  {/* Delete Action (Admin Only) */}
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={actionLoading}
                      className="cursor-pointer col-span-2 gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Permanently
                    </Button>
                  )}
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Permanently Delete
            </DialogTitle>
            <DialogDescription className="text-sm pt-1">
              Are you sure you want to permanently delete this booking for{" "}
              <strong>{selectedBooking?.guest_details?.full_name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Booking Dialog Add / Edit forms ── */}
      <BookingFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        getToken={getToken}
        onSubmit={handleAddBooking}
      />

      <BookingFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        booking={selectedBooking}
        getToken={getToken}
        onSubmit={handleEditBooking}
      />
    </div>
  )
}
