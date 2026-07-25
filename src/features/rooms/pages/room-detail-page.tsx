"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { fetchRoom, updateRoom, toggleRoomClean, toggleRoomInspect } from "../api"
import type { Room } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoomStatusBadge, BookingStatusBadge } from "@/components/shared"
import { formatCurrency } from "@/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { EditRoomDialog, ChangeStatusDialog } from "../components/room-dialogs"
import {
  ArrowLeft,
  Bed,
  Phone,
  Mail,
  User,
  CalendarDays,
  AlertTriangle,
  History,
  ShieldAlert,
  Loader2,
  CheckCircle,
  Sparkles,
  Layers,
  Tv,
  Wifi,
  Coffee,
  Compass,
  Edit,
  Plus,
  ExternalLink,
  Wrench,
  CheckCircle2,
} from "lucide-react"

interface RoomDetailPageProps {
  roomId: string | number
}

const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes("wifi") || n.includes("internet")) return <Wifi className="h-3.5 w-3.5 text-sky-500" />
  if (n.includes("tv") || n.includes("television")) return <Tv className="h-3.5 w-3.5 text-indigo-500" />
  if (n.includes("ac") || n.includes("air") || n.includes("condition")) return <Compass className="h-3.5 w-3.5 text-cyan-500" />
  if (n.includes("coffee") || n.includes("tea") || n.includes("maker")) return <Coffee className="h-3.5 w-3.5 text-amber-600" />
  return <Sparkles className="h-3.5 w-3.5 text-primary/70" />
}

export function RoomDetailPage({ roomId }: RoomDetailPageProps) {
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const prefix = pathname.startsWith("/receptionist") ? "/receptionist" : "/admin"
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingHousekeeping, setTogglingHousekeeping] = useState(false)

  // Dialog States
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

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

  const handleUpdateRoom = async (values: any) => {
    if (!room) return
    try {
      const token = await getToken()
      if (!token) return
      await updateRoom(room.id, values, token)
      toast.success("Room updated successfully")
      setEditOpen(false)
      loadDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to update room")
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!room) return
    try {
      const token = await getToken()
      if (!token) return
      await updateRoom(room.id, { status: newStatus }, token)
      toast.success(`Room status updated to ${newStatus}`)
      setStatusOpen(false)
      loadDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to change room status")
    }
  }

  const handleToggleClean = async () => {
    if (!room) return
    setTogglingHousekeeping(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await toggleRoomClean(room.id, token)
      toast.success(`Room ${room.room_number} is now marked as ${res.is_clean ? "Clean" : "Dirty"}`)
      loadDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle cleanliness")
    } finally {
      setTogglingHousekeeping(false)
    }
  }

  const handleToggleInspect = async () => {
    if (!room) return
    setTogglingHousekeeping(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await toggleRoomInspect(room.id, token)
      toast.success(`Room ${room.room_number} inspection marked as ${res.is_inspected ? "Inspected" : "Pending"}`)
      loadDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle inspection")
    } finally {
      setTogglingHousekeeping(false)
    }
  }

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
        <div className="flex items-center gap-2">
          {room && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="cursor-pointer gap-1.5"
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
                Edit Room
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusOpen(true)}
                className="cursor-pointer gap-1.5"
              >
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                Change Status
              </Button>
            </>
          )}
          <Link to={`${prefix}/rooms`}>
            <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Rooms
            </Button>
          </Link>
        </div>
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
          <div className="space-y-6">
            
            {/* ── Profile Header Block ── */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary shrink-0">
                    <Bed className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Room {room.room_number}</h1>
                      <RoomStatusBadge status={room.status} />
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        room.is_clean 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" 
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {room.is_clean ? "Clean" : "Dirty"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        room.is_inspected 
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900" 
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                      }`}>
                        {room.is_inspected ? "Inspected" : "Pending Inspection"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <span className="capitalize font-medium">{room.room_type?.toLowerCase()} Room</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>{room.capacity} {room.capacity > 1 ? "Guests" : "Guest"} Capacity</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>Floor {room.floor}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rate Per Night</span>
                  <span className="text-2xl font-bold text-primary mt-0.5">{formatCurrency(room.price_per_night)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ── Left Column: Specifications & Amenities ── */}
              <div className="space-y-6 lg:col-span-1">
                
                {/* Specifications Card */}
                <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-primary" /> Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Floor</span>
                        <p className="text-sm font-semibold text-foreground">Level {room.floor}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Max Capacity</span>
                        <p className="text-sm font-semibold text-foreground">{room.capacity} {room.capacity > 1 ? "People" : "Person"}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3 space-y-1 col-span-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pricing Rate</span>
                        <p className="text-sm font-bold text-primary">{formatCurrency(room.price_per_night)} <span className="text-xs font-normal text-muted-foreground">/ night</span></p>
                      </div>
                    </div>
                    {room.description && (
                      <div className="border-t border-border pt-4">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Description</span>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{room.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Housekeeping Controls Card */}
                <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Housekeeping Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">Cleanliness Status</span>
                        <span className="text-[11px] text-muted-foreground">
                          {room.is_clean ? "Ready for guest stay" : "Turn-down service required"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={room.is_clean ? "outline" : "default"}
                        onClick={handleToggleClean}
                        disabled={togglingHousekeeping}
                        className={`h-8 text-xs gap-1.5 cursor-pointer font-semibold ${
                          !room.is_clean ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {room.is_clean ? "Mark Dirty" : "Mark Clean"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">Inspection Audit</span>
                        <span className="text-[11px] text-muted-foreground">
                          {room.is_inspected ? "Verified by supervisor" : "Awaiting inspection check"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={room.is_inspected ? "outline" : "default"}
                        onClick={handleToggleInspect}
                        disabled={togglingHousekeeping || !room.is_clean}
                        className={`h-8 text-xs gap-1.5 cursor-pointer font-semibold ${
                          !room.is_inspected && room.is_clean ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                        }`}
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        {room.is_inspected ? "Mark Pending" : "Mark Inspected"}
                      </Button>
                    </div>

                    {!room.is_clean && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-medium leading-relaxed">
                        ⚠️ <strong>Housekeeping Gate Active:</strong> Guests cannot check into this room until it is cleaned.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Amenities Card */}
                <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Amenities & Extras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {amenitiesList.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {amenitiesList.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-lg border border-border/50 px-2.5 py-1.5 bg-card hover:bg-muted/10 transition-colors">
                            {getAmenityIcon(amenity)}
                            <span className="text-xs font-medium text-foreground capitalize truncate">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-2 text-center">No amenities specified for this room.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ── Right Column: Status & History ── */}
              <div className="space-y-6 lg:col-span-2">
                
                {/* Dynamic Status / Occupant details card */}
                {room.status === "OCCUPIED" && room.current_booking ? (
                  <Card className="border-border border-t-4 border-t-primary shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Current Resident
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                          {room.current_booking?.guest?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "G"}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{room.current_booking?.guest?.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Active checked-in stay</p>
                        </div>
                        <Link
                          to={`${prefix}/bookings?search=${encodeURIComponent(room.current_booking?.guest?.name || "")}`}
                          className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                        >
                          Manage Booking
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Phone</span>
                              <span className="font-medium text-foreground">{room.current_booking?.guest?.phone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Email</span>
                              <span className="font-medium text-foreground truncate max-w-[180px]">{room.current_booking?.guest?.email || "—"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Stay Timeline</span>
                              <span className="font-semibold text-foreground">
                                {room.current_booking ? `${room.current_booking.check_in} to ${room.current_booking.check_out}` : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : room.status === "MAINTENANCE" ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 shrink-0">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Room is Out of Service</h3>
                        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                          This room is undergoing active maintenance. It is blocked from being checked into or reserved until resolved.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleChangeStatus("AVAILABLE")}
                      className="shrink-0 w-full md:w-auto gap-1.5 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4" /> Mark Available
                    </Button>
                  </div>
                ) : room.status === "CLEANING" ? (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 shrink-0">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm">Room is Cleaning</h3>
                        <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1 leading-relaxed">
                          Housekeeping is currently servicing this room. It will be marked available shortly.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleChangeStatus("AVAILABLE")}
                      className="shrink-0 w-full md:w-auto gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4" /> Mark Available
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Room is Available</h3>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 leading-relaxed">
                          This room is currently clean, vacant, and fully ready for walk-in check-ins or incoming guest reservations.
                        </p>
                      </div>
                    </div>
                    <Link to={`${prefix}/bookings?action=new&room_id=${room.id}`} className="shrink-0">
                      <Button
                        size="sm"
                        className="w-full md:w-auto gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="h-4 w-4" /> Book Room
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Booking History */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <History className="h-3.5 w-3.5 text-primary" /> Stay History
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border text-muted-foreground font-medium bg-muted/10">
                      Last 10 Stays
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {room.booking_history && room.booking_history.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {room.booking_history.map((stay) => (
                          <div
                            key={stay.id}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors uppercase">
                                {stay.guest_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "G"}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors">{stay.guest_name}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {stay.check_in} to {stay.check_out}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <BookingStatusBadge status={stay.status} />
                              <span className="font-bold text-foreground text-right text-xs min-w-[70px]">
                                {formatCurrency(stay.total_price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Compass className="h-8 w-8 mx-auto stroke-1 mb-2 opacity-60" />
                        <p className="text-xs italic">No previous stay history recorded for this room.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

            </div>

            {/* Dialogs */}
            <EditRoomDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              room={room}
              onEdit={handleUpdateRoom}
            />

            <ChangeStatusDialog
              open={statusOpen}
              onOpenChange={setStatusOpen}
              room={room}
              onStatusChange={handleChangeStatus}
            />
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
