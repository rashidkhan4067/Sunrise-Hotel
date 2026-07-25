"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, UserCheck } from "lucide-react"
import type { UpcomingArrival } from "@/hooks/use-dashboard-data"

export function UpcomingArrivals({ arrivals }: { arrivals: UpcomingArrival[] }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = pathname.startsWith("/receptionist") ? "/receptionist" : "/admin"

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <UserCheck className="h-4 w-4 text-primary" />
          Upcoming Arrivals
        </CardTitle>
        <CardDescription className="text-xs">Guests arriving in the next few days</CardDescription>
      </CardHeader>
      <CardContent className="p-0 border-t border-border/80">
        {arrivals.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic">
            No upcoming arrivals scheduled.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {arrivals.map((arr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`${prefix}/bookings?search=${encodeURIComponent(arr.guestName)}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 uppercase">
                    {arr.guestName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "G"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-xs truncate">{arr.guestName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] text-foreground font-semibold">Room {arr.roomNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary/70" />
                      Arriving: {arr.arrivalDate}
                    </span>
                    <span className="text-[10px] text-foreground font-bold">{arr.nights} night{arr.nights !== 1 ? "s" : ""} stay</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
