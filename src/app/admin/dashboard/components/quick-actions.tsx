"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { downloadCSV } from "@/utils/format"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Calendar, Search, Download, Sparkles } from "lucide-react"
import type { DashboardPayload, TodayCheckInOut } from "@/hooks/use-dashboard-data"

export function QuickActions({
  onNewBooking,
  onAddGuest,
  onAddRoom,
  todayCheckIns,
  todayCheckOuts,
  summary,
}: {
  onNewBooking: () => void
  onAddGuest: () => void
  onAddRoom: () => void
  todayCheckIns: TodayCheckInOut[]
  todayCheckOuts: TodayCheckInOut[]
  summary: DashboardPayload["summary"]
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { role } = useAuth()
  const prefix = pathname.startsWith("/receptionist") ? "/receptionist" : "/admin"
  const [searchQuery, setSearchQuery] = useState("")
  const isAdmin = role === "org:admin"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${prefix}/bookings?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleExportDailyCSV = () => {
    const headers = ["Category", "Guest Name", "Room Number", "Status"]
    const rows: string[][] = []

    // Summary stats
    rows.push(["Daily Summary Stats", "", "", ""])
    rows.push(["Total Rooms", String(summary.totalRooms), "", ""])
    rows.push(["Occupied Rooms", String(summary.occupiedRooms), "", ""])
    rows.push(["Available Rooms", String(summary.availableRooms), "", ""])
    rows.push(["Today Check-ins Count", String(summary.todayCheckInsCount), "", ""])
    rows.push(["Today Check-outs Count", String(summary.todayCheckOutsCount), "", ""])
    rows.push(["", "", "", ""])

    // Arrivals
    rows.push(["Today's Check-ins", "", "", ""])
    if (todayCheckIns.length === 0) {
      rows.push(["None", "", "", ""])
    } else {
      todayCheckIns.forEach(item => {
        rows.push(["Check-in", item.guestName, String(item.roomNumber), item.status])
      })
    }
    rows.push(["", "", "", ""])

    // Departures
    rows.push(["Today's Check-outs", "", "", ""])
    if (todayCheckOuts.length === 0) {
      rows.push(["None", "", "", ""])
    } else {
      todayCheckOuts.forEach(item => {
        rows.push(["Check-out", item.guestName, String(item.roomNumber), item.status])
      })
    }

    downloadCSV(headers, rows, `shift_report_${new Date().toISOString().split("T")[0]}`)
    toast.success("Daily shift summary CSV exported!")
  }

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-card/60 backdrop-blur-xs">
      <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Operations
        </CardTitle>
        <CardDescription className="text-xs">Hotel administration control shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-1.5">
          <div className="relative w-full">
            <Input
              placeholder="Search guest or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs pr-8 bg-background/50 border-border/80 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-primary cursor-pointer rounded-r-lg"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2 cursor-pointer border-border/80 hover:bg-muted/60 hover:text-primary transition-all duration-200" onClick={onNewBooking}>
            <Plus className="h-3.5 w-3.5 text-primary" />
            Create Booking
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2 cursor-pointer border-border/80 hover:bg-muted/60 hover:text-primary transition-all duration-200" onClick={onAddGuest}>
            <Plus className="h-3.5 w-3.5 text-primary" />
            Add Guest
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2 cursor-pointer border-border/80 hover:bg-muted/60 hover:text-primary transition-all duration-200" onClick={onAddRoom}>
              <Plus className="h-3.5 w-3.5 text-primary" />
              Add Room
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-9 text-xs justify-start gap-2 cursor-pointer border-border/80 hover:bg-muted/60 hover:text-primary transition-all duration-200" onClick={() => navigate(`${prefix}/calendar`)}>
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Open Calendar
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-9 text-xs justify-start gap-2 col-span-2 cursor-pointer bg-primary text-primary-foreground shadow-xs hover:shadow-sm hover:brightness-110 active:scale-98 transition-all"
            onClick={handleExportDailyCSV}
          >
            <Download className="h-3.5 w-3.5" />
            Export Shift Report (CSV)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
