"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { fetchBookings, createBooking, cancelBooking } from "@/features/bookings/api"
import type { Booking } from "@/features/bookings/types"
import { BookingStatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  BookingFormDialog,
  CancelBookingDialog
} from "@/features/bookings/components/booking-dialogs"
import { BookingDetailView } from "@/features/bookings/components/booking-detail-view"
import { formatCurrency, formatDate } from "@/utils/format"
import { toast } from "sonner"
import { 
  CalendarDays, 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  Receipt, 
  Calendar,
  XCircle,
  Eye,
  Loader2,
  Inbox
} from "lucide-react"

export default function GuestBookingsPage() {
  const { getToken } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [bookings, setBookings] = useState<Booking[]>(null!)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Dialog states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Load bookings
  async function loadBookings() {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const data = await fetchBookings(token)
      const list = Array.isArray(data) ? data : (data.results || [])
      setBookings(list)
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to load your reservations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [getToken])

  // Watch for ?action=new query param
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormOpen(true)
      // Clean up the query param
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("action")
      setSearchParams(newParams)
    }
  }, [searchParams, setSearchParams])

  // Filter bookings locally
  const filteredBookings = (bookings || []).filter((b) => {
    const q = search.toLowerCase()
    const matchesSearch =
      b.booking_id.toLowerCase().includes(q) ||
      (b.room_details?.room_number || "").includes(q) ||
      (b.room_details?.room_type || "").toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Create booking submit handler
  async function handleCreateBooking(data: any) {
    setActionLoading(true)
    try {
      const token = await getToken()
      await createBooking(data, token!)
      toast.success("Reservation created successfully!")
      setFormOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create reservation.")
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel booking submit handler
  async function handleCancelBooking() {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await cancelBooking(selectedBooking.booking_id, token!)
      toast.success("Stay cancelled successfully")
      setCancelOpen(false)
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Cancellation failed.")
    } finally {
      setActionLoading(false)
    }
  }

  const statusCategories = [
    { label: "All Stay Stays", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Checked In", value: "CHECKED_IN" },
    { label: "Completed", value: "CHECKED_OUT" },
    { label: "Cancelled", value: "CANCELLED" }
  ]

  return (
    <BaseLayout
      role="guest"
      title="My Reservations"
      description="View past stay history, invoice details, and manage upcoming reservations."
      actions={
        <Button onClick={() => setFormOpen(true)} className="cursor-pointer font-semibold shadow-2xs">
          <Plus className="mr-2 h-4 w-4" />
          Book a Room
        </Button>
      }
    >
      <div className="px-4 lg:px-6 space-y-6">
        {/* Filters and search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-2">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-muted/65 rounded-xl border border-border/60 max-w-fit">
            {statusCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setStatusFilter(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === cat.value
                    ? "bg-background text-foreground shadow-3xs border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/80" />
            <Input
              placeholder="Search by Room or Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm font-semibold">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border/60 min-h-[300px] bg-card/40">
            <Inbox className="size-10 text-muted-foreground/50 mb-3" />
            <CardTitle className="text-sm font-bold">No stays found</CardTitle>
            <CardDescription className="text-xs max-w-xs mt-1 leading-relaxed">
              We couldn't find any stays matching your filters. Make a reservation to get started.
            </CardDescription>
            <Button variant="outline" size="sm" className="mt-5 font-semibold cursor-pointer" onClick={() => setFormOpen(true)}>
              Book a Room Now
            </Button>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((b) => (
              <Card key={b.booking_id} className="border-border/80 shadow-3xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden bg-card/60">
                {/* Card Header with room/status */}
                <CardHeader className="pb-3 border-b border-border/60">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                        ID: {b.booking_id}
                      </span>
                      <h4 className="text-sm font-black text-foreground truncate mt-0.5">
                        Room {b.room_details?.room_number || "—"} ({b.room_details?.room_type || "—"})
                      </h4>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </CardHeader>

                {/* Card Body */}
                <CardContent className="pt-4 pb-3 space-y-3.5 text-xs">
                  {/* Checkin / Checkout date */}
                  <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-500" />
                        Check-in
                      </span>
                      <p className="font-bold text-foreground mt-0.5">{formatDate(b.check_in)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        Check-out
                      </span>
                      <p className="font-bold text-foreground mt-0.5">{formatDate(b.check_out)}</p>
                    </div>
                  </div>

                  {/* Pricing and Capacity details */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{b.adults} Adult{b.adults !== 1 && "s"} {b.children > 0 && `| ${b.children} Child`}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-foreground">
                      <Receipt className="h-3.5 w-3.5 text-primary" />
                      <span>{formatCurrency(b.total_price)}</span>
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer Actions */}
                <CardFooter className="pt-2 border-t border-border/60 bg-muted/5 gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(b)
                      setDetailOpen(true)
                    }}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Details
                  </Button>

                  {["PENDING", "CONFIRMED"].includes(b.status) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs font-semibold bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(b)
                        setCancelOpen(true)
                      }}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bookings creation Form Dialog */}
      <BookingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="add"
        getToken={getToken}
        onSubmit={handleCreateBooking}
        loading={actionLoading}
      />

      {/* Booking details drawer */}
      <BookingDetailView
        open={detailOpen}
        onOpenChange={setDetailOpen}
        booking={selectedBooking}
      />

      {/* Booking cancellation confirmation dialog */}
      <CancelBookingDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        booking={selectedBooking}
        onConfirm={handleCancelBooking}
        loading={actionLoading}
      />
    </BaseLayout>
  )
}
