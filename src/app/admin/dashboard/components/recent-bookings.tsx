"use client"

import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/format"
import { CalendarDays, ArrowRight } from "lucide-react"
import type { RecentBooking } from "@/hooks/use-dashboard-data"

export function RecentBookings({ bookings }: { bookings: RecentBooking[] }) {
  const navigate = useNavigate()

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Recent Bookings
          </CardTitle>
          <CardDescription className="text-xs">Latest reservations logged in database</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer gap-1" onClick={() => navigate("/admin/bookings")}>
          View All Bookings
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 border-t border-border/80">
        {bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic">
            No bookings recorded.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {bookings.map((b) => (
              <div
                key={b.bookingId}
                className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/admin/bookings?search=${encodeURIComponent(b.bookingId)}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 uppercase">
                    {b.guestName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "G"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-xs truncate">{b.guestName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
                      <span className="font-mono text-muted-foreground/75">#{b.bookingId.slice(0, 8)}</span>
                      <span>•</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] text-foreground font-semibold">Room {b.roomNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">{b.checkIn} → {b.checkOut}</span>
                    <span className="font-bold text-foreground text-xs">{formatCurrency(b.totalPrice)}</span>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
