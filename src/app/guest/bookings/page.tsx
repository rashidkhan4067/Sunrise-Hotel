"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { fetchBookings, createBooking, cancelBooking } from "@/features/bookings/api"
import type { Booking } from "@/features/bookings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardDescription, CardTitle, Card } from "@/components/ui/card"
import {
  BookingFormDialog,
  CancelBookingDialog
} from "@/features/bookings/components/booking-dialogs"
import { BookingDetailView } from "@/features/bookings/components/booking-detail-view"
import { toast } from "sonner"
import { 
  Search, 
  Plus, 
  Loader2,
  Inbox
} from "lucide-react"
import { BookingCard } from "./components/booking-card"

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
      const list = Array.isArray(data) ? data : ((data as any)?.results || [])
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

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailOpen(true)
  }

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setCancelOpen(true)
  }

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
              <BookingCard
                key={b.booking_id}
                booking={b}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelClick}
              />
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
