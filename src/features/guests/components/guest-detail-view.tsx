import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookingStatusBadge } from "@/components/shared"
import { formatDate } from "@/utils/format"
import type { Guest } from "../types"
import { useEffect, useState } from "react"
import { fetchGuestBookings } from "../api"
import { User, Phone, Mail, Loader2, AlertCircle } from "lucide-react"

interface GuestDetailViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  token: string
}

interface MiniBooking {
  booking_id: string
  room_details?: {
    room_number: string
    room_type: string
  }
  check_in: string
  check_out: string
  status: string
  total_price: string | number
}





export function GuestDetailView({ open, onOpenChange, guest, token }: GuestDetailViewProps) {
  const [bookings, setBookings] = useState<MiniBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !guest) return
    setLoading(true)
    setError(null)
    fetchGuestBookings(guest.id, token)
      .then((data) => setBookings(Array.isArray(data) ? data : (data.results || [])))
      .catch((err) => setError(err?.message || "Failed to load booking history"))
      .finally(() => setLoading(false))
  }, [open, guest, token])

  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span>Guest Profile Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact & Identity</h3>
            <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/15">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Full Name</span>
                <span className="font-semibold text-foreground">{guest.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Phone Number</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {guest.phone_number}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Email Address</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  {guest.email || <span className="text-muted-foreground/50 italic">None</span>}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Document ID</span>
                <span className="font-mono text-xs text-foreground bg-background px-2 py-0.5 rounded border border-border">
                  {guest.document_number}
                </span>
              </div>
              {guest.address && (
                <div className="flex flex-col gap-1 text-sm border-t border-border/40 pt-2.5">
                  <span className="text-muted-foreground font-medium">Address</span>
                  <span className="text-muted-foreground text-xs">{guest.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking History */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Booking History</h3>

            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-muted/10 p-4 rounded-lg border border-dashed border-border text-center">
                No bookings recorded for this guest profile yet.
              </p>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between text-xs p-3 rounded-lg border border-border bg-card hover:bg-muted/10 transition animate-in fade-in-50 duration-200"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        Room {booking.room_details?.room_number || "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(booking.check_in)} to {formatDate(booking.check_out)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookingStatusBadge status={booking.status} />
                      <span className="font-semibold text-foreground text-right min-w-[50px]">
                        ${Number(booking.total_price).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
