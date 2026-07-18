"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { fetchRoom } from "../api"
import type { Room } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoomStatusBadge, BookingStatusBadge } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Bed,
  Phone,
  Mail,
  User,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  History,
  ShieldAlert,
  Loader2,
  CheckCircle,
} from "lucide-react"

interface RoomDetailPageProps {
  roomId: string | number
}



export function RoomDetailPage({ roomId }: RoomDetailPageProps) {
  const { getToken } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadDetails() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const data = await fetchRoom(roomId, token!)
      setRoom(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load room details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const typeLabel = room?.room_type
    ? room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1).toLowerCase()
    : ""

  const amenitiesList = room?.amenities
    ? room.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : []

  return (
    <BaseLayout
      title={room ? `Room ${room.room_number}` : "Room Details"}
      description="Detailed log of room information, current guest, and booking history."
      actions={
        <Link to="/admin/rooms">
          <Button variant="outline" size="sm" className="cursor-pointer gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Button>
        </Link>
      }
    >
      <div className="px-4 lg:px-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading room details...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDetails}
              className="ml-auto cursor-pointer text-destructive"
            >
              Retry
            </Button>
          </div>
        ) : room ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ── Left Column: Room Profile & Info ── */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Bed className="h-4 w-4" /> Room Profile
                  </CardTitle>
                  <RoomStatusBadge status={room.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Room {room.room_number}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{typeLabel} Type Room</p>
                  </div>
                  
                  <div className="divide-y divide-border/60 text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">Floor Location</span>
                      <span className="font-semibold text-foreground">Floor {room.floor}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">Capacity</span>
                      <span className="font-semibold text-foreground">{room.capacity} {room.capacity > 1 ? "Guests" : "Guest"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">Price Per Night</span>
                      <span className="font-bold text-sm text-foreground flex items-center gap-0.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        {Number(room.price_per_night).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {room.description && (
                    <div className="border-t border-border pt-3">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Description</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{room.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Amenities & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {amenitiesList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {amenitiesList.map((amenity, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 font-medium border-border/80 text-foreground bg-muted/20">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No amenities specified for this room.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column: Stay Details & Histories ── */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Current Occupant Details */}
              {room.status === "OCCUPIED" && room.current_booking ? (
                <Card className="border-border border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Current Active Guest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Guest Name</span>
                        <span className="font-semibold text-foreground">{room.current_booking.guest?.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Phone Number</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {room.current_booking.guest?.phone}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Email Address</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {room.current_booking.guest?.email || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Check-In Date</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-muted-foreground" />
                          {room.current_booking.check_in}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Scheduled Check-Out</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-muted-foreground" />
                          {room.current_booking.check_out}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Stay Status</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none scale-90 origin-right">
                          Active Stay
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : room.status === "MAINTENANCE" ? (
                <Card className="border-border border-l-4 border-l-red-500 bg-red-500/5">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                    <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Maintenance Notice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This room is currently flagged under maintenance and is unavailable for incoming check-ins or reservations. Cleaners or engineers must restore operational availability first.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border border-l-4 border-l-emerald-500 bg-emerald-500/5">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Room Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The room is vacant, clean, and ready for walk-in guest registration or upcoming reservations.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Booking History */}
              <Card className="border-border">
                <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Booking History (Last 10 stays)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {room.booking_history && room.booking_history.length > 0 ? (
                    <div className="space-y-2">
                      {room.booking_history.map((stay) => (
                        <div
                          key={stay.id}
                          className="flex items-center justify-between text-xs p-3 rounded-lg border border-border bg-card hover:bg-muted/10 transition"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground">{stay.guest_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {stay.check_in} to {stay.check_out}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <BookingStatusBadge status={stay.status} />
                            <span className="font-bold text-foreground text-right min-w-[60px]">
                              ${stay.total_price.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-6">
                      No previous stay history recorded for this room.
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[200px] text-sm text-muted-foreground">
            Room profile not found.
          </div>
        )}
      </div>
    </BaseLayout>
  )
}
