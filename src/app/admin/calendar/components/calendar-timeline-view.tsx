"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BedDouble, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomItem {
  id: string
  room_number: string
  room_type: string
  status: string
}

interface BookingItem {
  booking_id: string
  guest_details?: { full_name: string }
  room_details?: { room_number: string }
  check_in: string
  check_out: string
  status: string
}

interface CalendarTimelineViewProps {
  rooms: RoomItem[]
  bookings: BookingItem[]
  onSelectBooking?: (bookingId: string) => void
}

export function CalendarTimelineView({ rooms, bookings, onSelectBooking }: CalendarTimelineViewProps) {
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 3) // Start 3 days prior
    return d
  })

  // Generate 14 days grid
  const days = useMemo(() => {
    const list: Date[] = []
    for (let i = 0; i < 14; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      list.push(d)
    }
    return list
  }, [startDate])

  const handlePrev = () => {
    const d = new Date(startDate)
    d.setDate(d.getDate() - 7)
    setStartDate(d)
  }

  const handleNext = () => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + 7)
    setStartDate(d)
  }

  const handleToday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    setStartDate(d)
  }

  const isToday = (d: Date) => {
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }

  return (
    <Card className="border border-border/60 shadow-xs rounded-2xl overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-muted/20">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <BedDouble className="h-4 w-4 text-primary" />
            <span>Interactive Room Stay Timeline</span>
          </CardTitle>
          <CardDescription className="text-xs">
            14-day reservation Gantt chart across physical room inventory.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs h-7 font-bold">
            Reset to Today
          </Button>
          <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/40">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[950px]">
          {/* Header Row: Days */}
          <div className="grid grid-cols-[180px_repeat(14,1fr)] border-b border-border/40 bg-muted/50 text-xs font-bold">
            <div className="p-3 text-muted-foreground border-r border-border/40 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <BedDouble className="h-3.5 w-3.5 text-primary" />
              <span>Room / Date</span>
            </div>
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className={cn(
                  "p-2 text-center border-r border-border/30 last:border-0 transition-colors",
                  isToday(d) ? "bg-primary/15 text-primary font-black" : "text-muted-foreground"
                )}
              >
                <div className="text-[10px] uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className="text-xs font-black">{d.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Room Rows */}
          <div className="divide-y divide-border/30">
            {rooms.map((room) => {
              const roomBookings = bookings.filter(
                (b) => b.room_details?.room_number === room.room_number
              )

              return (
                <div key={room.id} className="grid grid-cols-[180px_repeat(14,1fr)] items-center min-h-[56px] hover:bg-muted/10 transition-colors">
                  {/* Left Column: Room Badge */}
                  <div className="p-3 border-r border-border/40 bg-muted/20 font-medium text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground text-xs">Room {room.room_number}</span>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 border-border/60">
                        {room.room_type}
                      </Badge>
                    </div>
                  </div>

                  {/* 14 Day Timeline Cells */}
                  {days.map((day) => {
                    const dayStr = day.toISOString().split("T")[0]
                    const activeBooking = roomBookings.find((b) => {
                      return dayStr >= b.check_in && dayStr < b.check_out
                    })

                    return (
                      <div
                        key={dayStr}
                        className={cn(
                          "h-full min-h-[56px] border-r border-border/20 last:border-0 p-1 flex items-center justify-center relative",
                          isToday(day) ? "bg-primary/5" : ""
                        )}
                      >
                        {activeBooking ? (
                          <button
                            onClick={() => onOpenBooking(activeBooking.booking_id, onSelectBooking)}
                            className={cn(
                              "w-full h-10 px-2 rounded-lg text-xs font-bold flex items-center justify-between truncate transition-all cursor-pointer shadow-2xs border",
                              activeBooking.status === "CHECKED_IN"
                                ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30"
                                : activeBooking.status === "CONFIRMED"
                                ? "bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-500/40 hover:bg-blue-500/30"
                                : "bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-500/40 hover:bg-purple-500/30"
                            )}
                            title={`Guest: ${activeBooking.guest_details?.full_name || 'Guest'} (${activeBooking.check_in} → ${activeBooking.check_out})`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate text-[10px]">{activeBooking.guest_details?.full_name || "Guest"}</span>
                            </span>
                          </button>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function onOpenBooking(bookingId: string, onSelectBooking?: (id: string) => void) {
  if (onSelectBooking) {
    onSelectBooking(bookingId)
  }
}
