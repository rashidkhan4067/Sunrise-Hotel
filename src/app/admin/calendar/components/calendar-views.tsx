"use client"

import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { Booking } from "@/features/bookings/types"
import type { CalendarEvent } from "../types"
import { STATUS_CONFIG } from "../types"
import { EventCard } from "./event-card"

interface CalendarViewsProps {
  viewMode: "day" | "week" | "month"
  currentDate: Date
  setCurrentDate: (date: Date) => void
  getDayEvents: (date: Date) => CalendarEvent[]
  openDetail: (booking: Booking) => void
}

export function CalendarViews({
  viewMode,
  currentDate,
  setCurrentDate,
  getDayEvents,
  openDetail,
}: CalendarViewsProps) {
  return (
    <div className="flex-1 overflow-x-auto">
      {/* DAY VIEW */}
      {viewMode === "day" && (
        <div className="min-w-[300px] max-w-xl mx-auto p-6 bg-background/50 backdrop-blur-xs">
          <div className="text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground pb-3.5 border-b border-border/20">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </div>
          <div className="space-y-3 mt-6 max-h-[500px] overflow-y-auto pr-1">
            {getDayEvents(currentDate).length > 0 ? (
              getDayEvents(currentDate).map((ev) => (
                <EventCard key={ev.id} ev={ev} onClick={() => openDetail(ev.booking)} />
              ))
            ) : (
              <div className="text-center py-16 border border-dashed border-border/40 rounded-xl bg-muted/5">
                <p className="text-xs text-muted-foreground/75 italic">
                  No check-ins or check-outs scheduled for today.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <div className="flex flex-col md:grid md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border bg-transparent">
          {Array.from({ length: 7 }).map((_, i) => {
            const start = startOfWeek(currentDate)
            const day = addDays(start, i)
            const dayEvs = getDayEvents(day)
            const isDayToday = isToday(day)

            return (
              <div key={i} className="flex flex-col min-h-0 md:min-h-[480px]">
                {/* Day Header */}
                <div
                  className={cn(
                    "p-3 border-b border-border/20 flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 transition-all duration-200 select-none",
                    isDayToday 
                      ? "bg-primary/5 font-semibold" 
                      : "bg-muted/5 hover:bg-muted/10"
                  )}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                    <span className="md:hidden">{format(day, "EEEE")}</span>
                    <span className="hidden md:inline">{format(day, "eee")}</span>
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200",
                      isDayToday 
                        ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20" 
                        : "text-muted-foreground bg-muted/30 hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Day Events Column */}
                <div className="flex-1 p-3 space-y-3 max-h-[300px] md:max-h-[450px] overflow-y-auto bg-card/5">
                  {dayEvs.length > 0 ? (
                    dayEvs.map((ev) => (
                      <EventCard key={ev.id} ev={ev} onClick={() => openDetail(ev.booking)} />
                    ))
                  ) : (
                    <div className="py-8 md:h-full flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/30 italic font-medium tracking-wide">No events</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === "month" && (
        <div className="w-full flex flex-col">
          <div className="grid grid-cols-7 border-b border-border/30 divide-x divide-border/30 bg-muted/20">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-border/30 border-b border-border/30 bg-transparent">
            {(() => {
              const monthStart = startOfMonth(currentDate)
              const monthEnd = endOfMonth(currentDate)
              const calStart = new Date(monthStart)
              calStart.setDate(calStart.getDate() - monthStart.getDay())
              const calEnd = new Date(monthEnd)
              calEnd.setDate(calEnd.getDate() + (6 - monthEnd.getDay()))
              const days = eachDayOfInterval({ start: calStart, end: calEnd })

              return days.map((day) => {
                const dayEvs = getDayEvents(day)
                const inMonth = isSameMonth(day, currentDate)
                const isDayToday = isToday(day)
                const isSelected = isSameDay(day, currentDate)

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setCurrentDate(day)}
                    className={cn(
                      "min-h-[50px] md:min-h-[90px] p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none border-border/20",
                      inMonth 
                        ? isSelected
                          ? "bg-primary/5 hover:bg-primary/10 ring-2 ring-primary ring-inset"
                          : "hover:bg-muted/10 bg-card"
                        : "bg-muted/5 opacity-30 hover:bg-muted/10",
                      isDayToday && !isSelected ? "bg-primary/5" : ""
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200",
                          isDayToday 
                            ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    {/* Desktop: show full event list buttons */}
                    <div className="hidden md:block space-y-1 mt-1 max-h-[60px] overflow-y-auto">
                      {dayEvs.map((ev) => {
                        const isCheckIn = ev.kind === "checkin"
                        return (
                          <button
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(ev.booking)
                            }}
                            className={cn(
                              "w-full text-left text-[9px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 truncate cursor-pointer transition-all duration-150 border border-transparent",
                              isCheckIn
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/15"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", isCheckIn ? "bg-emerald-500" : "bg-blue-500")} />
                            {ev.booking.room_details?.room_number || "—"} · {ev.booking.guest_details?.full_name?.split(" ")[0]}
                          </button>
                        )
                      })}
                    </div>

                    {/* Mobile: show small indicator dots */}
                    {dayEvs.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5 md:hidden">
                        {dayEvs.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              STATUS_CONFIG[ev.booking.status]?.dot || "bg-primary"
                            )}
                          />
                        ))}
                        {dayEvs.length > 3 && (
                          <span className="text-[7px] leading-none text-muted-foreground font-bold">+</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>

          {/* Mobile Selected Day Agenda list below the calendar */}
          <div className="block md:hidden p-4 bg-muted/5 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Agenda for {format(currentDate, "MMMM d, yyyy")}
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {getDayEvents(currentDate).length > 0 ? (
                getDayEvents(currentDate).map((ev) => (
                  <EventCard key={ev.id} ev={ev} onClick={() => openDetail(ev.booking)} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-6 text-center">
                  No check-ins or check-outs scheduled for this day.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
