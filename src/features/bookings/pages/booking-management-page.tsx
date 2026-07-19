"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, ClipboardList, Clock, LogIn, LogOut, TrendingUp, MoreHorizontal, BadgeInfo, Edit, XCircle, Trash2 } from "lucide-react"
import { ErrorBanner, BookingStatusBadge, DataTable, FilterBar, type ColumnDef } from "@/components/shared"
import { StatCard } from "@/components/stat-card"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Booking } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatDate, formatShortId } from "@/utils/format"
import { BookingDetailView } from "../components/booking-detail-view"
import {
  BookingFormDialog,
  CheckInDialog,
  CheckOutDialog,
  CancelBookingDialog,
  DeleteBookingDialog,
} from "../components/booking-dialogs"
import { useSearchParams } from "react-router-dom"
import type { BookingFormValues } from "../schemas"
import {
  fetchBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
} from "../api"
import { isAdminRole } from "@/lib/utils"

export function BookingManagementPage() {
  const { getToken, role: authRole } = useAuth()
  const role = authRole || "org:member"
  const [searchParams] = useSearchParams()

  // ─── State ───────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  // Filters
  const [search, setSearch] = useState(() => searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(() => {
    const s = searchParams.get("status")
    return s ? s.toUpperCase() : "all"
  })
  const [typeFilter, setTypeFilter] = useState("all")
  const [checkInFilter, setCheckInFilter] = useState("")
  const [checkOutFilter, setCheckOutFilter] = useState("")

  // Selected booking for actions
  const [selected, setSelected] = useState<Booking | null>(null)

  // Dialog states
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setAddOpen(true)
    }
    const searchVal = searchParams.get("search")
    if (searchVal !== null) {
      setSearch(searchVal)
    }
    const statusVal = searchParams.get("status")
    if (statusVal !== null) {
      setStatusFilter(statusVal.toUpperCase())
    }
  }, [searchParams])

  // ─── Load Bookings ────────────────────────────
  async function loadBookings() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const data = await fetchBookings(token!)
      setBookings(Array.isArray(data) ? data : ((data as any)?.results || []))
    } catch (err: any) {
      setError(err?.message || "Failed to load bookings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Filtered Bookings ────────────────────────
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !search ||
        b.booking_id.toLowerCase().includes(q) ||
        (b.guest_details?.full_name || "").toLowerCase().includes(q) ||
        (b.guest_details?.phone_number || "").includes(q) ||
        (b.room_details?.room_number || "").includes(q)

      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter

      const matchesType =
        typeFilter === "all" ||
        b.room_details?.room_type === typeFilter

      const matchesCheckIn =
        !checkInFilter || b.check_in >= checkInFilter

      const matchesCheckOut =
        !checkOutFilter || b.check_out <= checkOutFilter

      return matchesSearch && matchesStatus && matchesType && matchesCheckIn && matchesCheckOut
    })
  }, [bookings, search, statusFilter, typeFilter, checkInFilter, checkOutFilter])

  function resetFilters() {
    setSearch("")
    setStatusFilter("all")
    setTypeFilter("all")
    setCheckInFilter("")
    setCheckOutFilter("")
  }

  // ─── Handlers ────────────────────────────────
  async function handleAdd(values: BookingFormValues) {
    const token = await getToken()
    await createBooking(values, token!)
    toast.success("Booking created successfully")
    await loadBookings()
  }

  async function handleEdit(values: BookingFormValues) {
    if (!selected) return
    const token = await getToken()
    await updateBooking(selected.booking_id, values, token!)
    toast.success("Booking updated successfully")
    await loadBookings()
  }

  async function handleCheckIn() {
    if (!selected) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await checkInBooking(selected.booking_id, token!)
      toast.success(`${selected.guest_details?.full_name} has been checked in`)
      setCheckInOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Check-in failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!selected) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await checkOutBooking(selected.booking_id, token!)
      toast.success(`${selected.guest_details?.full_name} has been checked out`)
      setCheckOutOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Check-out failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!selected) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await cancelBooking(selected.booking_id, token!)
      toast.success("Booking cancelled")
      setCancelOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Cancellation failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await deleteBooking(selected.booking_id, token!)
      toast.success("Booking deleted")
      setDeleteOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Delete failed")
    } finally {
      setActionLoading(false)
    }
  }

  const isAdmin = isAdminRole(role)

  const bookingColumns: ColumnDef<Booking>[] = [
    {
      header: "Booking ID",
      className: "w-[120px]",
      hideOnMobile: true,
      cell: (booking) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{formatShortId(booking.booking_id)}
        </span>
      ),
    },
    {
      header: "Guest",
      cell: (booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">
            {booking.guest_details?.full_name || "—"}
          </span>
          <span className="text-xs text-muted-foreground">
            {booking.guest_details?.phone_number || ""}
          </span>
          {/* Mobile-only compact info row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 md:hidden">
            <span className="text-xs text-muted-foreground font-medium">
              Room {booking.room_details?.room_number || "—"}
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Room",
      hideOnMobile: true,
      cell: (booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">
            Room {booking.room_details?.room_number || "—"}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {booking.room_details?.room_type?.toLowerCase() || ""}
          </span>
        </div>
      ),
    },
    {
      header: "Check-in",
      hideOnMobile: true,
      cell: (booking) => <span className="text-sm text-muted-foreground">{formatDate(booking.check_in)}</span>,
    },
    {
      header: "Check-out",
      hideOnMobile: true,
      cell: (booking) => <span className="text-sm text-muted-foreground">{formatDate(booking.check_out)}</span>,
    },
    {
      header: "Guests",
      hideOnMobile: true,
      cell: (booking) => (
        <span className="text-sm text-muted-foreground">
          {booking.adults}A {booking.children > 0 ? `${booking.children}C` : ""}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (booking) => <BookingStatusBadge status={booking.status} />,
    },
    {
      header: "Created",
      hideOnMobile: true,
      cell: (booking) => <span className="text-xs text-muted-foreground">{formatDate(booking.created_at)}</span>,
    },
    {
      header: "",
      className: "w-[60px] text-right",
      cell: (booking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelected(booking)
                setDetailOpen(true)
              }}
              className="cursor-pointer gap-2"
            >
              <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>

            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
              <DropdownMenuItem
                onClick={() => {
                  setSelected(booking)
                  setEditOpen(true)
                }}
                className="cursor-pointer gap-2"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                Edit Booking
              </DropdownMenuItem>
            )}

            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
              <DropdownMenuItem
                onClick={() => {
                  setSelected(booking)
                  setCheckInOpen(true)
                }}
                className="cursor-pointer gap-2"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-500" />
                Check-In
              </DropdownMenuItem>
            )}

            {booking.status === "CHECKED_IN" && (
              <DropdownMenuItem
                onClick={() => {
                  setSelected(booking)
                  setCheckOutOpen(true)
                }}
                className="cursor-pointer gap-2"
              >
                <LogOut className="h-3.5 w-3.5 text-blue-500" />
                Check-Out
              </DropdownMenuItem>
            )}

            {(booking.status === "PENDING" ||
              booking.status === "CONFIRMED" ||
              booking.status === "CHECKED_IN") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(booking)
                    setCancelOpen(true)
                  }}
                  className="cursor-pointer gap-2 text-amber-600 hover:!bg-amber-500/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Booking
                </DropdownMenuItem>
              </>
            )}

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(booking)
                    setDeleteOpen(true)
                  }}
                  className="cursor-pointer gap-2 text-destructive hover:!bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const bookingEmptyState = (
    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
      <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
        <BadgeInfo className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-sm">No bookings found</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Try adjusting your filters or create a new booking.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAddOpen(true)}
        className="cursor-pointer"
      >
        Create First Booking
      </Button>
    </div>
  )

  // ─── Render ───────────────────────────────────
  return (
    <BaseLayout
      title="Bookings"
      description="Manage guest reservations, check-ins, and check-outs."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            disabled={loading}
            className="cursor-pointer gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-4 lg:px-6">

      {/* Error state */}
      {error && !loading && (
        <ErrorBanner message={error} onRetry={loadBookings} />
      )}

      {/* Summary cards using single StatCard component */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[105px] rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Bookings",
              value: filtered.length,
              icon: ClipboardList,
              badgeText: filtered.length !== bookings.length ? "Filtered" : "Live",
              footerText: filtered.length !== bookings.length ? `${filtered.length} of ${bookings.length} total` : "All system reservations",
              footerSubtext: "Active & completed bookings",
            },
            {
              title: "Pending / Confirmed",
              value: filtered.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED").length,
              icon: Clock,
              badgeText: "Upcoming",
              footerText: "Awaiting arrival",
              footerSubtext: "Confirmed guest stays",
            },
            {
              title: "Checked In",
              value: filtered.filter((b) => b.status === "CHECKED_IN").length,
              icon: LogIn,
              badgeText: "In-House",
              footerText: "Currently occupying",
              footerIcon: TrendingUp,
              footerSubtext: "Active room occupants",
            },
            {
              title: "Checked Out",
              value: filtered.filter((b) => b.status === "CHECKED_OUT").length,
              icon: LogOut,
              badgeText: "Completed",
              footerText: "Fulfilled stays",
              footerSubtext: "Departure queue completed",
            },
          ].map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>
      )}

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Guest, Room, Booking ID...",
          label: "Search",
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
          {
            id: "type",
            label: "Room Type",
            value: typeFilter,
            onValueChange: setTypeFilter,
            options: [
              { label: "All Types", value: "all" },
              { label: "Single", value: "SINGLE" },
              { label: "Double", value: "DOUBLE" },
              { label: "Twin", value: "TWIN" },
              { label: "Deluxe", value: "DELUXE" },
              { label: "Suite", value: "SUITE" },
              { label: "Family", value: "FAMILY" },
            ],
          },
        ]}
        onReset={resetFilters}
        isFiltered={search !== "" || statusFilter !== "all" || typeFilter !== "all" || checkInFilter !== "" || checkOutFilter !== ""}
      >
        <div className="w-full sm:w-auto sm:min-w-[140px] space-y-1.5">
          <Label htmlFor="check-in-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-In</Label>
          <Input
            id="check-in-filter"
            type="date"
            value={checkInFilter}
            onChange={(e) => setCheckInFilter(e.target.value)}
            className="cursor-pointer"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[140px] space-y-1.5">
          <Label htmlFor="check-out-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-Out</Label>
          <Input
            id="check-out-filter"
            type="date"
            value={checkOutFilter}
            onChange={(e) => setCheckOutFilter(e.target.value)}
            className="cursor-pointer"
          />
        </div>
      </FilterBar>

      {/* Data table */}
      <DataTable
        data={filtered}
        columns={bookingColumns}
        loading={loading}
        emptyState={bookingEmptyState}
      />

      {/* Dialogs */}
      <BookingFormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mode="add"
          getToken={getToken}
          onSubmit={handleAdd}
        />

      <BookingFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          booking={selected}
          getToken={getToken}
          onSubmit={handleEdit}
        />

      <BookingDetailView
        open={detailOpen}
        onOpenChange={setDetailOpen}
        booking={selected}
      />

      <CheckInDialog
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        booking={selected}
        onConfirm={handleCheckIn}
        loading={actionLoading}
      />

      <CheckOutDialog
        open={checkOutOpen}
        onOpenChange={setCheckOutOpen}
        booking={selected}
        onConfirm={handleCheckOut}
        loading={actionLoading}
      />

      <CancelBookingDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        booking={selected}
        onConfirm={handleCancel}
        loading={actionLoading}
      />

      <DeleteBookingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        booking={selected}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
    </BaseLayout>
  )
}
