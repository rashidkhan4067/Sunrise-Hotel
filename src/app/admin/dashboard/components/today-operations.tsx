"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/shared"
import { ArrowUpRight, ArrowDownRight, ClipboardList, LogIn, LogOut } from "lucide-react"
import type { TodayCheckInOut } from "@/hooks/use-dashboard-data"

export function TodayOperations({
  checkIns,
  checkOuts,
}: {
  checkIns: TodayCheckInOut[]
  checkOuts: TodayCheckInOut[]
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = pathname.startsWith("/receptionist") ? "/receptionist" : "/admin"

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <ClipboardList className="h-4 w-4 text-primary" />
          Today's Operations
        </CardTitle>
        <CardDescription className="text-xs">Monitor arrivals and departures for today</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Today's Check-ins */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-2">
            <div className="h-5 w-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            Check-ins ({checkIns.length})
          </h3>
          {checkIns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-xl bg-muted/10 border-border/80">
              <LogIn className="h-5 w-5 text-muted-foreground/40 mb-1" />
              <p className="text-xs text-muted-foreground">No arrivals today</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {checkIns.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`${prefix}/bookings?search=${encodeURIComponent(item.guestName)}`)}
                  className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/40 text-xs cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-[10px] group-hover:scale-105 transition-transform uppercase">
                      {item.guestName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "G"}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.guestName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Room {item.roomNumber}</p>
                    </div>
                  </div>
                  <BookingStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Check-outs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-2">
            <div className="h-5 w-5 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ArrowDownRight className="h-3.5 w-3.5" />
            </div>
            Check-outs ({checkOuts.length})
          </h3>
          {checkOuts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-xl bg-muted/10 border-border/80">
              <LogOut className="h-5 w-5 text-muted-foreground/40 mb-1" />
              <p className="text-xs text-muted-foreground">No departures today</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {checkOuts.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`${prefix}/bookings?search=${encodeURIComponent(item.guestName)}`)}
                  className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/40 text-xs cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-[10px] group-hover:scale-105 transition-transform uppercase">
                      {item.guestName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "G"}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.guestName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Room {item.roomNumber}</p>
                    </div>
                  </div>
                  <BookingStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
