import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/shared"
import { formatDate, formatCurrency } from "@/utils/format"
import type { Booking } from "../types"
import { CalendarDays, User, Bed, DollarSign, Clock, Printer } from "lucide-react"
import { InvoiceModal } from "./invoice-modal"

interface BookingDetailViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm text-foreground font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export function BookingDetailView({ open, onOpenChange, booking }: BookingDetailViewProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  if (!booking) return null

  const nights =
    booking.check_in && booking.check_out
      ? Math.ceil(
          (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <span>Booking Details</span>
              {booking.status && (
                <BookingStatusBadge status={booking.status} />
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Booking Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking Information
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(true)} className="h-7 text-xs gap-1.5">
                  <Printer className="h-3.5 w-3.5 text-primary" />
                  Print Official Invoice
                </Button>
              </div>
              <div className="rounded-lg border border-border px-3">
                <DetailRow label="Booking ID" value={<span className="font-mono text-xs">{booking.booking_id}</span>} />
                <DetailRow label="Created At" value={formatDate(booking.created_at)} />
                <DetailRow label="Nights" value={`${nights} night${nights !== 1 ? "s" : ""}`} />
                <DetailRow
                  label="Total Price"
                  value={<span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(booking.total_price)}</span>}
                />
              </div>
            </div>

            {/* Guest Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Guest Information
                </span>
              </div>
              <div className="rounded-lg border border-border px-3">
                <DetailRow label="Full Name" value={booking.guest_details?.full_name || "—"} />
                <DetailRow label="Phone" value={booking.guest_details?.phone_number || "—"} />
                {booking.guest_details?.email && (
                  <DetailRow label="Email" value={booking.guest_details.email} />
                )}
                <DetailRow label="Document No." value={booking.guest_details?.document_number || "—"} />
                <DetailRow
                  label="Guests"
                  value={`${booking.adults} Adult${booking.adults !== 1 ? "s" : ""}${
                    booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}` : ""
                  }`}
                />
              </div>
            </div>

            {/* Room Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bed className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Room Information
                </span>
              </div>
              <div className="rounded-lg border border-border px-3">
                <DetailRow label="Room Number" value={`Room ${booking.room_details?.room_number || "—"}`} />
                <DetailRow label="Room Type" value={
                  <span className="capitalize">{booking.room_details?.room_type?.toLowerCase() || "—"}</span>
                } />
                <DetailRow label="Floor" value={`Floor ${booking.room_details?.floor ?? "—"}`} />
                <DetailRow label="Capacity" value={`${booking.room_details?.capacity ?? "—"} Guests`} />
                <DetailRow
                  label="Rate/Night"
                  value={formatCurrency(booking.room_details?.price_per_night)}
                />
              </div>
            </div>

            {/* Booking Timeline */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stay Timeline
                </span>
              </div>
              <div className="rounded-lg border border-border px-3">
                <DetailRow label="Check-in" value={formatDate(booking.check_in)} />
                <DetailRow label="Check-out" value={formatDate(booking.check_out)} />
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Folio Invoicing
                </span>
              </div>
              <div className="rounded-lg border border-border px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Folio Billing Ledger</span>
                  <Button variant="ghost" size="sm" onClick={() => setInvoiceOpen(true)} className="h-6 text-xs text-primary font-semibold">
                    View Full Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InvoiceModal
        bookingId={booking.booking_id}
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
      />
    </>
  )
}
