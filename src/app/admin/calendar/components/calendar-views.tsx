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
import { EventCard } from "./event-card"
import { Sparkles, CalendarDays } from "lucide-react"

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
    <div className="flex-1 w-full">
      {/* ─── DAY VIEW ─── */}
      {viewMode === "day" && (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {format(currentDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-xs text-muted-foreground">Daily Operations Agenda</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              {getDayEvents(currentDate).length} Scheduled Events
            </span>
          </div>

          <div className="space-y-3">
            {getDayEvents(currentDate).length > 0 ? (
              getDayEvents(currentDate).map((ev) => (
                <EventCard key={ev.id} ev={ev} onClick={() => openDetail(ev.booking)} />
              ))
            ) : (
              <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-muted/10">
                <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs font-medium text-muted-foreground">
                  No check-ins or check-outs scheduled for this day.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── WEEK VIEW ─── */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 })
            const day = addDays(start, i)
            const dayEvs = getDayEvents(day)
            const isDayToday = isToday(day)

            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden min-h-[360px]",
                  isDayToday
                    ? "bg-card border-primary/50 ring-2 ring-primary/20 shadow-sm"
                    : "bg-card/80 border-border/50 shadow-2xs hover:border-border"
                )}
              >
                {/* Day Header */}
                <div
                  className={cn(
                    "p-3 text-center border-b select-none flex flex-col items-center gap-1",
                    isDayToday
                      ? "bg-gradient-to-b from-primary/15 via-primary/5 to-transparent border-primary/20"
                      : "bg-muted/30 border-border/30"
                  )}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {format(day, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-extrabold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                      isDayToday
                        ? "bg-primary text-primary-foreground shadow-xs shadow-primary/30"
                        : "text-foreground bg-muted/40"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events List (No individual column scrollbar!) */}
                <div className="flex-1 p-2 space-y-2">
                  {dayEvs.length > 0 ? (
                    dayEvs.map((ev) => (
                      <EventCard key={ev.id} ev={ev} onClick={() => openDetail(ev.booking)} />
                    ))
                  ) : (
                    <div className="h-full min-h-[140px] flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/35 font-medium italic">
                        No events
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── MONTH VIEW ─── */}
      {viewMode === "month" && (
        <div className="w-full flex flex-col rounded-2xl border border-border/50 overflow-hidden shadow-2xs">
          {/* Header Row */}
          <div className="grid grid-cols-7 border-b border-border/40 bg-muted/40 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground py-2.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border/30 bg-card">
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
                      "min-h-[85px] sm:min-h-[110px] p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none border-border/20 relative group",
                      inMonth
                        ? isSelected
                          ? "bg-primary/5 ring-2 ring-primary ring-inset"
                          : "hover:bg-accent/40 bg-card"
                        : "bg-muted/10 opacity-40 hover:opacity-75",
                      isDayToday && !isSelected ? "bg-primary/5" : ""
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all",
                          isDayToday
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {dayEvs.length > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {dayEvs.length}
                        </span>
                      )}
                    </div>

                    {/* Events list */}
                    <div className="hidden sm:block space-y-1 mt-1.5 overflow-hidden">
                      {dayEvs.slice(0, 2).map((ev) => {
                        const isCheckIn = ev.kind === "checkin"
                        return (
                          <button
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(ev.booking)
                            }}
                            className={cn(
                              "w-full text-left text-[9px] font-bold px-2 py-1 rounded-md flex items-center justify-between truncate cursor-pointer transition-colors border",
                              isCheckIn
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20"
                            )}
                          >
                            <span className="truncate">R{ev.booking.room_details?.room_number || "—"}</span>
                            <span className="truncate opacity-75">{ev.booking.guest_details?.full_name?.split(" ")[0]}</span>
                          </button>
                        )
                      })}
                      {dayEvs.length > 2 && (
                        <p className="text-[9px] text-muted-foreground font-semibold text-center">
                          +{dayEvs.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
