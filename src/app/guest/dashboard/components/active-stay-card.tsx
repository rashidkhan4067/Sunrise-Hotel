"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/shared"
import { formatCurrency, formatDate } from "@/utils/format"
import { Key, MapPin, Clock, LogOut, Calendar } from "lucide-react"

interface GuestStay {
  booking_id: string
  room_details?: {
    room_number: string
    room_type: string
  }
  check_in: string
  check_out: string
  status: string
  total_price: string | number
  adults: number
  children: number
}

interface ActiveStayCardProps {
  activeStay: GuestStay | null
  loading: boolean
  onBookClick: () => void
}

export function ActiveStayCard({ activeStay, loading, onBookClick }: ActiveStayCardProps) {
  return (
    <Card className="md:col-span-2 border-border/80 shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          Your Current Stay
        </CardTitle>
        <CardDescription className="text-xs">Active and upcoming reservation summary</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="mt-2 font-medium">Loading your stay...</span>
          </div>
        ) : activeStay ? (
          <div className="space-y-6">
            {/* Status, Room & Dates */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl border border-border/60 bg-background/30">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Stay Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <BookingStatusBadge status={activeStay.status} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Room Allocation</span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  Room {activeStay.room_details?.room_number || "—"} ({activeStay.room_details?.room_type || "—"})
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Total Charge</span>
                <p className="text-xs font-black text-foreground mt-0.5">
                  {formatCurrency(activeStay.total_price)}
                </p>
              </div>
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10 space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  Check-In Date
                </span>
                <p className="text-xs font-bold text-foreground">{formatDate(activeStay.check_in)}</p>
                <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  After 2:00 PM
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10 space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <LogOut className="h-3 w-3 text-blue-500" />
                  Check-Out Date
                </span>
                <p className="text-xs font-bold text-foreground">{formatDate(activeStay.check_out)}</p>
                <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  Before 12:00 PM
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/60 rounded-xl min-h-[190px] bg-background/20">
            <Calendar className="size-8 text-muted-foreground mb-3 opacity-60" />
            <p className="text-foreground text-xs font-bold">No Active Reservations</p>
            <p className="text-[10px] text-muted-foreground mt-1 max-w-xs leading-relaxed">Book your next stay at Sunrise Hotel to unlock check-in status, digital keys, and room services.</p>
            <Button variant="outline" size="sm" className="mt-4 font-semibold text-xs cursor-pointer hover:text-primary transition-colors" onClick={onBookClick}>
              Make a Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
