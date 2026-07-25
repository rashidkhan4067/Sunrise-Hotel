import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/shared"
import { MapPin, Users, Receipt, Eye, XCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import type { Booking } from "@/features/bookings/types"

interface BookingCardProps {
  booking: Booking
  onViewDetails: (booking: Booking) => void
  onCancel: (booking: Booking) => void
}

export function BookingCard({ booking, onViewDetails, onCancel }: BookingCardProps) {
  return (
    <Card className="border-border/80 shadow-3xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden bg-card/60">
      {/* Card Header with room/status */}
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <span className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
              ID: {booking.booking_id}
            </span>
            <h4 className="text-sm font-black text-foreground truncate mt-0.5">
              Room {booking.room_details?.room_number || "—"} ({booking.room_details?.room_type || "—"})
            </h4>
          </div>
          <BookingStatusBadge status={booking.status} />
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
            <p className="font-bold text-foreground mt-0.5">{formatDate(booking.check_in)}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-blue-500" />
              Check-out
            </span>
            <p className="font-bold text-foreground mt-0.5">{formatDate(booking.check_out)}</p>
          </div>
        </div>

        {/* Pricing and Capacity details */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{booking.adults} Adult{booking.adults !== 1 && "s"} {booking.children > 0 && `| ${booking.children} Child`}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-foreground">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <span>{formatCurrency(booking.total_price)}</span>
          </div>
        </div>
      </CardContent>

      {/* Card Footer Actions */}
      <CardFooter className="pt-2 border-t border-border/60 bg-muted/5 gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => onViewDetails(booking)}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Details
        </Button>

        {["PENDING", "CONFIRMED"].includes(booking.status) && (
          <Button
            variant="destructive"
            size="sm"
            className="text-xs font-semibold bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent transition-all cursor-pointer"
            onClick={() => onCancel(booking)}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
