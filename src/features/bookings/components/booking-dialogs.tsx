"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, LogIn, LogOut, XCircle } from "lucide-react"
import { bookingFormSchema, type BookingFormValues } from "../schemas"
import type { Booking, Guest } from "../types"
import type { Room } from "@/features/rooms"
import { fetchAvailableRooms, fetchGuests } from "../api"

// ─────────────────────────────────────────────
// Add / Edit Booking Dialog
// ─────────────────────────────────────────────

interface BookingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  booking?: Booking | null
  getToken: () => Promise<string | null>
  onSubmit: (values: BookingFormValues) => Promise<void>
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function BookingFormDialog({
  open,
  onOpenChange,
  mode,
  booking,
  getToken,
  onSubmit,
}: BookingFormDialogProps) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [fetchingRooms, setFetchingRooms] = useState(false)
  const [guestsLoading, setGuestsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema) as any,
    defaultValues: {
      guest: "",
      room: "",
      check_in: today,
      check_out: "",
      adults: 1,
      children: 0,
      status: "PENDING",
    },
  })

  const checkIn = watch("check_in")
  const checkOut = watch("check_out")

  // Compute nights dynamically
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const diff =
      new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
  }, [checkIn, checkOut])

  // Compute estimated price from selected room
  const selectedRoomId = watch("room")
  const selectedRoom = availableRooms.find(
    (r) => String(r.id) === String(selectedRoomId)
  )
  const estimatedPrice =
    selectedRoom && nights > 0
      ? (Number(selectedRoom.price_per_night) * nights).toFixed(2)
      : null

  // Load guests on open
  useEffect(() => {
    if (!open) return
    setGuestsLoading(true)
    getToken().then((token) => fetchGuests(token!))
      .then((data) => setGuests(data))
      .catch(() => setGuests([]))
      .finally(() => setGuestsLoading(false))
  }, [open, getToken])

  // Load available rooms when dates change
  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setAvailableRooms([])
      return
    }
    setFetchingRooms(true)
    getToken().then((token) => fetchAvailableRooms(checkIn, checkOut, token!))
      .then((data) => setAvailableRooms(Array.isArray(data) ? data : ((data as any)?.results || [])))
      .catch(() => setAvailableRooms([]))
      .finally(() => setFetchingRooms(false))
  }, [checkIn, checkOut, getToken])

  // Populate form when editing
  useEffect(() => {
    if (!open) return
    if (mode === "edit" && booking) {
      reset({
        guest: String(booking.guest),
        room: String(booking.room),
        check_in: booking.check_in,
        check_out: booking.check_out,
        adults: booking.adults,
        children: booking.children,
        status: booking.status,
      })
    } else {
      reset({
        guest: "",
        room: "",
        check_in: today,
        check_out: "",
        adults: 1,
        children: 0,
        status: "PENDING",
      })
    }
    setSubmitError(null)
  }, [open, mode, booking, reset, today])

  const onValid = async (values: BookingFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === "add" ? "New Booking" : "Edit Booking"
  const description =
    mode === "add"
      ? "Create a new guest reservation. Rooms shown are available for the selected dates."
      : "Update reservation details for this booking."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="space-y-5">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Date" htmlFor="check_in" error={errors.check_in?.message}>
              <Input
                id="check_in"
                type="date"
                min={today}
                className="cursor-pointer"
                {...register("check_in")}
              />
            </FormField>

            <FormField label="Check-out Date" htmlFor="check_out" error={errors.check_out?.message}>
              <Input
                id="check_out"
                type="date"
                min={checkIn || today}
                className="cursor-pointer"
                {...register("check_out")}
              />
            </FormField>
          </div>

          {/* Stay summary */}
          {nights > 0 && (
            <div className="text-xs text-muted-foreground flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
              {estimatedPrice && (
                <>
                  <span className="text-border">|</span>
                  <span>Estimated total: <strong className="text-foreground">${estimatedPrice}</strong></span>
                </>
              )}
              {fetchingRooms && (
                <>
                  <span className="text-border">|</span>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Loading available rooms...</span>
                </>
              )}
            </div>
          )}

          {/* Guest */}
          <FormField label="Guest" htmlFor="guest-select" error={errors.guest?.message}>
            {guestsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading guests...
              </div>
            ) : (
              <Controller
                name="guest"
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="guest-select" className="cursor-pointer">
                      <SelectValue placeholder="Select a guest..." />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.length === 0 ? (
                        <SelectItem value="-" disabled>No guests found</SelectItem>
                      ) : (
                        guests.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.full_name} — {g.phone_number}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Room */}
          <FormField label="Room" htmlFor="room-select" error={errors.room?.message}>
            {!checkIn || !checkOut || checkOut <= checkIn ? (
              <p className="text-xs text-muted-foreground italic py-2">
                Select valid check-in and check-out dates to see available rooms.
              </p>
            ) : fetchingRooms ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking availability...
              </div>
            ) : (
              <Controller
                name="room"
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="room-select" className="cursor-pointer">
                      <SelectValue placeholder="Select an available room..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.length === 0 ? (
                        <SelectItem value="-" disabled>No rooms available for these dates</SelectItem>
                      ) : (
                        availableRooms.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            Room {r.room_number} — {r.room_type?.toLowerCase()} — ${Number(r.price_per_night).toFixed(2)}/night
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Adults / Children */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Adults" htmlFor="adults" error={errors.adults?.message}>
              <Input
                id="adults"
                type="number"
                min={1}
                max={10}
                {...register("adults", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Children" htmlFor="children" error={errors.children?.message}>
              <Input
                id="children"
                type="number"
                min={0}
                max={10}
                {...register("children", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          {/* Booking Status (edit only) */}
          {mode === "edit" && (
            <FormField label="Status" htmlFor="status-select" error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status-select" className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                      <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          )}

          {submitError && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "add" ? "Create Booking" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Shared Confirm Dialog
// ─────────────────────────────────────────────

interface StatusAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  onConfirm: () => Promise<void>
  loading: boolean
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmClassName,
  loading,
  onConfirm,
  icon,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description: React.ReactNode
  confirmLabel: string
  confirmClassName?: string
  loading: boolean
  onConfirm: () => Promise<void>
  icon?: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer ${confirmClassName}`}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Check-In Confirm
// ─────────────────────────────────────────────

export function CheckInDialog({ open, onOpenChange, booking, onConfirm, loading }: StatusAlertProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Check-In"
      description={
        <>
          Check-in guest <strong>{booking?.guest_details?.full_name}</strong> into{" "}
          <strong>Room {booking?.room_details?.room_number}</strong>? This will mark the room as Occupied.
        </>
      }
      confirmLabel="Check-In Guest"
      confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
      loading={loading}
      onConfirm={onConfirm}
      icon={<LogIn className="h-5 w-5 text-emerald-500" />}
    />
  )
}

// ─────────────────────────────────────────────
// Check-Out Confirm
// ─────────────────────────────────────────────

export function CheckOutDialog({ open, onOpenChange, booking, onConfirm, loading }: StatusAlertProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Check-Out"
      description={
        <>
          Check-out guest <strong>{booking?.guest_details?.full_name}</strong> from{" "}
          <strong>Room {booking?.room_details?.room_number}</strong>? This will mark the room as Available.
        </>
      }
      confirmLabel="Check-Out Guest"
      confirmClassName="bg-blue-600 hover:bg-blue-700 text-white"
      loading={loading}
      onConfirm={onConfirm}
      icon={<LogOut className="h-5 w-5 text-blue-500" />}
    />
  )
}

// ─────────────────────────────────────────────
// Cancel Booking Confirm
// ─────────────────────────────────────────────

export function CancelBookingDialog({ open, onOpenChange, booking, onConfirm, loading }: StatusAlertProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Booking"
      description={
        <>
          Are you sure you want to cancel the booking for{" "}
          <strong>{booking?.guest_details?.full_name}</strong>? This action will free up the room and cannot be undone.
        </>
      }
      confirmLabel="Cancel Booking"
      confirmClassName="bg-amber-600 hover:bg-amber-700 text-white"
      loading={loading}
      onConfirm={onConfirm}
      icon={<XCircle className="h-5 w-5 text-amber-500" />}
    />
  )
}

// ─────────────────────────────────────────────
// Delete Booking Confirm
// ─────────────────────────────────────────────

export function DeleteBookingDialog({ open, onOpenChange, booking, onConfirm, loading }: StatusAlertProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Booking"
      description={
        <>
          Permanently delete this booking for{" "}
          <strong>{booking?.guest_details?.full_name}</strong>? This cannot be undone.
        </>
      }
      confirmLabel="Delete Permanently"
      confirmClassName="bg-destructive hover:bg-destructive/80 text-white"
      loading={loading}
      onConfirm={onConfirm}
      icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
    />
  )
}
