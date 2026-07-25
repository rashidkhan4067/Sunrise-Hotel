"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "react-router-dom"
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
import { Loader2, AlertTriangle, LogIn, XCircle, Printer, Plus, CreditCard, Receipt } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { useAppStore } from "@/store/use-app-store"
import { bookingFormSchema, type BookingFormValues } from "../schemas"
import type { Booking, Guest } from "../types"
import type { Room } from "@/features/rooms"
import { toggleRoomClean } from "@/features/rooms/api"
import { fetchAvailableRooms, fetchGuests, fetchFolioByBooking, postFolioItem } from "../api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

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
  const [searchParams] = useSearchParams()
  const queryRoomId = searchParams.get("room_id") || ""

  const [guests, setGuests] = useState<Guest[]>([])
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [fetchingRooms, setFetchingRooms] = useState(false)
  const [guestsLoading, setGuestsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema) as any,
    defaultValues: {
      guest: "",
      room: queryRoomId || "",
      check_in: today,
      check_out: tomorrow,
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
      .then((data) => {
        setGuests(data)
        if (data && data.length === 1 && mode === "add") {
          setValue("guest", String(data[0].id))
        }
      })
      .catch(() => setGuests([]))
      .finally(() => setGuestsLoading(false))
  }, [open, getToken, mode, setValue])

  // Load available rooms when dates change
  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setAvailableRooms([])
      return
    }
    setFetchingRooms(true)
    getToken().then((token) => fetchAvailableRooms(checkIn, checkOut, token!))
      .then((data) => {
        let roomsList = Array.isArray(data) ? data : ((data as any)?.results || [])
        if (mode === "edit" && booking && booking.room_details) {
          const hasCurrentRoom = roomsList.some((r: any) => String(r.id) === String(booking.room))
          if (!hasCurrentRoom) {
            roomsList = [booking.room_details, ...roomsList]
          }
        } else if (mode === "add" && queryRoomId) {
          // If we passed queryRoomId but the room list returned empty, keep the preset room if possible
          // In most cases, it will be fetched or will default to selected
        }
        setAvailableRooms(roomsList)
      })
      .catch(() => {
        let roomsList: Room[] = []
        if (mode === "edit" && booking && booking.room_details) {
          roomsList = [booking.room_details]
        }
        setAvailableRooms(roomsList)
      })
      .finally(() => setFetchingRooms(false))
  }, [checkIn, checkOut, getToken, mode, booking, queryRoomId])

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
          room: queryRoomId || "",
          check_in: today,
          check_out: tomorrow,
          adults: 1,
          children: 0,
          status: "PENDING",
        })
      }
    setSubmitError(null)
  }, [open, mode, booking, reset, today, queryRoomId])

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <span>Estimated total: <strong className="text-foreground">{formatCurrency(Number(estimatedPrice))}</strong></span>
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
            ) : guests.length === 1 ? (
              <Input
                id="guest-select"
                value={`${guests[0].full_name} (${guests[0].email || "No email"})`}
                disabled
                className="bg-muted text-muted-foreground select-none opacity-85"
              />
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
                            Room {r.room_number} — {r.room_type?.toLowerCase()} — {formatCurrency(r.price_per_night)}/night {r.is_clean === false ? " ⚠️ (Dirty - Needs Cleaning)" : ""}
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
  const { getToken } = useAuth()
  const [cleaning, setCleaning] = useState(false)
  const [isRoomClean, setIsRoomClean] = useState<boolean>(true)

  useEffect(() => {
    if (booking?.room_details) {
      setIsRoomClean(booking.room_details.is_clean !== false)
    }
  }, [booking])

  const handleQuickClean = async () => {
    if (!booking?.room_details?.id) return
    setCleaning(true)
    try {
      const token = await getToken()
      if (!token) return
      await toggleRoomClean(booking.room_details.id, token)
      toast.success(`Room ${booking.room_details.room_number} marked clean`)
      setIsRoomClean(true)
      if (booking.room_details) {
        booking.room_details.is_clean = true
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to mark room clean")
    } finally {
      setCleaning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-emerald-500" />
            <span>Confirm Check-In</span>
          </DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Check-in guest <strong>{booking?.guest_details?.full_name}</strong> into{" "}
            <strong>Room {booking?.room_details?.room_number}</strong>. This will mark the room as Occupied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Room Status</span>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${
                isRoomClean
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}>
                {isRoomClean ? "Clean & Ready" : "Dirty (Turn-Down Needed)"}
              </span>
            </div>
          </div>

          {!isRoomClean && (
            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block uppercase tracking-wider text-[10px]">Housekeeping Gate Active</strong>
                  Room {booking?.room_details?.room_number} is currently marked as Dirty. The system will block check-in until it is cleaned.
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleQuickClean}
                disabled={cleaning}
                className="w-full h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer mt-1"
              >
                {cleaning && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Quick Clean Room {booking?.room_details?.room_number} & Clear Gate
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs cursor-pointer">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading || cleaning}
            className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Confirm Check-In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Check-Out Confirm
// ─────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0 text-xs">
      <span className="text-muted-foreground uppercase font-semibold tracking-wider">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  )
}

export function CheckOutDialog({ open, onOpenChange, booking, onConfirm, loading }: StatusAlertProps) {
  const { getToken } = useAuth()
  const [folio, setFolio] = useState<any>(null)
  const [loadingFolio, setLoadingFolio] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDesc, setPaymentDesc] = useState("Visa Settlement")
  const [postingPayment, setPostingPayment] = useState(false)

  // Incidental form states
  const [showIncidentalForm, setShowIncidentalForm] = useState(false)
  const [incidentalDesc, setIncidentalDesc] = useState("")
  const [incidentalAmount, setIncidentalAmount] = useState("")
  const [incidentalType, setIncidentalType] = useState("INCIDENTAL")
  const [formErrors, setFormErrors] = useState<{ desc?: string; amount?: string }>({})

  const loadFolio = async () => {
    if (!booking) return
    setLoadingFolio(true)
    try {
      const token = await getToken()
      const data = await fetchFolioByBooking(booking.booking_id, token!)
      setFolio(data)
      if (data && data.balance > 0) {
        setPaymentAmount(data.balance.toString())
      } else {
        setPaymentAmount("")
      }
    } catch (err: any) {
      console.error("Failed to load folio:", err)
    } finally {
      setLoadingFolio(false)
    }
  }

  useEffect(() => {
    if (open && booking) {
      loadFolio()
      setShowIncidentalForm(false)
      setIncidentalDesc("")
      setIncidentalAmount("")
      setFormErrors({})
    } else {
      setFolio(null)
    }
  }, [open, booking])

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folio || !paymentAmount) return
    const amountVal = parseFloat(paymentAmount)
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error("Please enter a valid positive payment amount")
      return
    }

    setPostingPayment(true)
    try {
      const token = await getToken()
      await postFolioItem({
        folio: folio.id,
        item_type: "PAYMENT",
        description: paymentDesc || "Guest Payment",
        amount: -amountVal
      }, token!)
      toast.success("Payment posted successfully")
      await loadFolio()
    } catch (err: any) {
      toast.error(err?.message || "Failed to post payment")
    } finally {
      setPostingPayment(false)
    }
  }

  const handlePostIncidentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folio) return
    const errors: { desc?: string; amount?: string } = {}
    if (!incidentalDesc.trim()) {
      errors.desc = "Description is required"
    }
    if (!incidentalAmount) {
      errors.amount = "Amount is required"
    } else {
      const amountVal = parseFloat(incidentalAmount)
      if (isNaN(amountVal) || amountVal <= 0) {
        errors.amount = "Must be a positive number"
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    
    const amountVal = parseFloat(incidentalAmount)

    setPostingPayment(true)
    try {
      const token = await getToken()
      await postFolioItem({
        folio: folio.id,
        item_type: incidentalType,
        description: incidentalDesc,
        amount: amountVal
      }, token!)
      toast.success("Incidental charge posted successfully")
      setIncidentalDesc("")
      setIncidentalAmount("")
      setShowIncidentalForm(false)
      await loadFolio()
    } catch (err: any) {
      toast.error(err?.message || "Failed to post charge")
    } finally {
      setPostingPayment(false)
    }
  }

  const handlePrintInvoice = () => {
    if (!folio || !booking) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const charges = folio.items.filter((i: any) => parseFloat(i.amount) > 0)
    const payments = folio.items.filter((i: any) => parseFloat(i.amount) < 0)
    const totalCharges = charges.reduce((acc: number, i: any) => acc + parseFloat(i.amount), 0)
    const totalPayments = Math.abs(payments.reduce((acc: number, i: any) => acc + parseFloat(i.amount), 0))
    const finalBalance = totalCharges - totalPayments

    const itemsHtml = folio.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${new Date(item.created_at).toLocaleDateString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <span style="font-weight: 600; font-size: 11px; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; background: #f1f5f9;">
            ${item.item_type}
          </span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 500;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; text-align: right; color: ${item.amount < 0 ? '#10b981' : '#1e293b'}">
          ${formatCurrency(item.amount)}
        </td>
      </tr>
    `).join("")

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Folio #${folio.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }
            .header-container { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 30px; }
            .brand-name { font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #1e3a8a; }
            .invoice-label { font-size: 20px; font-weight: 700; text-align: right; color: #0f172a; }
            .meta-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .meta-section { width: 48%; }
            .meta-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: left; background-color: #f8fafc; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; }
            .summary-box { display: flex; flex-direction: column; align-items: flex-end; padding-top: 20px; border-top: 1px solid #e2e8f0; }
            .summary-row { display: flex; justify-content: space-between; width: 300px; margin-bottom: 8px; font-size: 14px; }
            .balance-row { font-size: 18px; font-weight: 700; color: #1e3a8a; margin-top: 8px; padding-top: 8px; border-top: 2px solid #1e3a8a; }
            .footer-note { margin-top: 100px; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <div class="brand-name">SUNRISE HOTEL</div>
              <div style="font-size: 13px; color: #64748b;">104 Pine Avenue, Capital City</div>
              <div style="font-size: 13px; color: #64748b;">billing@sunrisehotel.com</div>
            </div>
            <div class="invoice-label">
              <div>FOLIO INVOICE</div>
              <div style="font-size: 13px; font-weight: 500; color: #64748b; margin-top: 6px;">Invoice No: INV-${folio.id}-${booking.booking_id.substring(0, 5).toUpperCase()}</div>
              <div style="font-size: 13px; font-weight: 500; color: #64748b;">Generated: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="meta-grid">
            <div class="meta-section">
              <div class="meta-title">Guest Profile</div>
              <strong style="font-size: 15px; color: #0f172a;">${booking.guest_details?.full_name}</strong><br>
              <span style="font-size: 13px; color: #475569;">
                Email: ${booking.guest_details?.email}<br>
                Doc ID: ${booking.guest_details?.document_number || 'N/A'}<br>
                Phone: ${booking.guest_details?.phone_number || 'N/A'}
              </span>
            </div>
            <div class="meta-section">
              <div class="meta-title">Stay & Reservation</div>
              <span style="font-size: 13px; color: #475569;">
                Room: <strong>Room ${booking.room_details?.room_number}</strong> (${booking.room_details?.room_type})<br>
                Check-in: ${new Date(booking.check_in).toLocaleDateString()}<br>
                Check-out: ${new Date(booking.check_out).toLocaleDateString()}<br>
                Booking ID: ${booking.booking_id}
              </span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 15%;">Type</th>
                <th style="width: 50%;">Description</th>
                <th style="width: 20%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="summary-box">
            <div class="summary-row">
              <span>Total Debits (Charges):</span>
              <span>${formatCurrency(totalCharges)}</span>
            </div>
            <div class="summary-row">
              <span>Total Credits (Payments):</span>
              <span>${formatCurrency(-totalPayments)}</span>
            </div>
            <div class="summary-row balance-row">
              <span>Outstanding Balance:</span>
              <span>${formatCurrency(finalBalance)}</span>
            </div>
          </div>
          <div class="footer-note">
            Thank you for staying at Sunrise Hotel. We look forward to welcoming you again!
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const balance = folio ? parseFloat(folio.balance) : 0
  const isSettled = balance === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <span>Folio & Check-Out</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Verify room charges, record payments, and settle outstanding balances.
            </DialogDescription>
          </div>
          {folio && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              className="gap-1.5 h-8 text-xs cursor-pointer border-border mr-6"
            >
              <Printer className="size-3.5" />
              Print Folio
            </Button>
          )}
        </DialogHeader>

        {loadingFolio && !folio ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Loading billing folio ledger...</span>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {/* Guest Summary Card */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stay Summary
                </span>
              </div>
              <div className="rounded-lg border border-border px-3 bg-muted/20">
                <DetailRow label="Guest Name" value={booking?.guest_details?.full_name || "—"} />
                <DetailRow label="Allocated Room" value={`Room ${booking?.room_details?.room_number} (${booking?.room_details?.room_type})`} />
                <DetailRow
                  label="Stay Dates"
                  value={
                    booking ? (
                      <span className="text-xs text-foreground font-medium">
                        {new Date(booking.check_in).toLocaleDateString()} — {new Date(booking.check_out).toLocaleDateString()}
                      </span>
                    ) : "—"
                  }
                />
              </div>
            </div>

            {/* Folio Ledger List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Invoice Ledger
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIncidentalForm(!showIncidentalForm)}
                  disabled={postingPayment}
                  className="h-7 text-xs font-semibold text-primary hover:text-primary/95 gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  {showIncidentalForm ? "Cancel Add Charge" : "Post Charge / Fee"}
                </Button>
              </div>

              {/* Incidental Post Form */}
              {showIncidentalForm && (
                <form onSubmit={handlePostIncidentalSubmit} className="p-3 border border-border rounded-lg bg-muted/10 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="incidental-type" className="text-[11px] font-semibold text-muted-foreground">Charge Type</Label>
                      <Select value={incidentalType} onValueChange={setIncidentalType}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INCIDENTAL">Incidental Charge</SelectItem>
                          <SelectItem value="ROOM_SERVICE">Room Service</SelectItem>
                          <SelectItem value="MINIBAR">Mini-Bar Consumption</SelectItem>
                          <SelectItem value="LAUNDRY">Laundry Service</SelectItem>
                          <SelectItem value="SPA">Spa Treatments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="incidental-desc" className="text-[11px] font-semibold text-muted-foreground">Description</Label>
                      <Input
                        id="incidental-desc"
                        type="text"
                        placeholder="Description"
                        value={incidentalDesc}
                        onChange={(e) => {
                          setIncidentalDesc(e.target.value)
                          if (formErrors.desc) setFormErrors(prev => ({ ...prev, desc: undefined }))
                        }}
                        className={`h-8 text-xs ${formErrors.desc ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {formErrors.desc && (
                        <p className="text-[10px] font-medium text-destructive mt-0.5">{formErrors.desc}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="incidental-amount" className="text-[11px] font-semibold text-muted-foreground">
                        Amount ({useAppStore.getState().hotelInfo?.currency || "USD"})
                      </Label>
                      <Input
                        id="incidental-amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={incidentalAmount}
                        onChange={(e) => {
                          setIncidentalAmount(e.target.value)
                          if (formErrors.amount) setFormErrors(prev => ({ ...prev, amount: undefined }))
                        }}
                        className={`h-8 text-xs font-medium ${formErrors.amount ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {formErrors.amount && (
                        <p className="text-[10px] font-medium text-destructive mt-0.5">{formErrors.amount}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowIncidentalForm(false)} className="h-7 text-xs cursor-pointer">
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="h-7 text-xs cursor-pointer">
                      Add Charge
                    </Button>
                  </div>
                </form>
              )}

              {/* Ledger Table */}
              <div className="border border-border rounded-lg overflow-hidden bg-background">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Date</th>
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Type</th>
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Description</th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {folio?.items && folio.items.length > 0 ? (
                      folio.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-muted/5">
                          <td className="px-3 py-2.5 text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2.5 font-medium">
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold border ${
                              item.item_type === "ROOM" ? "bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" :
                              item.item_type === "TAX" ? "bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" :
                              item.item_type === "INCIDENTAL" ? "bg-purple-50/50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" :
                              item.item_type === "ROOM_SERVICE" ? "bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" :
                              item.item_type === "MINIBAR" ? "bg-red-50/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" :
                              item.item_type === "LAUNDRY" ? "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800" :
                              item.item_type === "SPA" ? "bg-pink-50/50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800" :
                              "bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                            }`}>
                              {item.item_type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-foreground font-semibold">{item.description}</td>
                          <td className={`px-3 py-2.5 text-right font-bold ${item.amount < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-5 text-muted-foreground font-medium">No ledger entries generated on this stay.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Settle and Guard block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
              {/* Balance Card */}
              <div className="p-4 border border-border rounded-lg bg-muted/10 flex flex-col justify-between h-[130px]">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Folio Balance Due</span>
                  <span className={`text-2xl font-extrabold tracking-tight mt-1 block ${isSettled ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`size-2.5 rounded-full ${isSettled ? "bg-emerald-500 animate-pulse" : "bg-destructive animate-pulse"}`} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {isSettled ? "Folio Fully Settled" : "Settlement Action Required"}
                  </span>
                </div>
              </div>

              {/* Record Payment Form */}
              {!isSettled && (
                <form onSubmit={handlePostPayment} className="space-y-3 p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-1.5 border-b border-border pb-1.5">
                    <CreditCard className="size-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Record Guest Payment</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="payment-amount"
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        disabled={postingPayment}
                        className="h-8 text-xs w-[110px]"
                      />
                      <Select value={paymentDesc} onValueChange={setPaymentDesc} disabled={postingPayment}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa Card Payment">Visa Card</SelectItem>
                          <SelectItem value="MasterCard Payment">MasterCard</SelectItem>
                          <SelectItem value="Cash Payment">Cash Payment</SelectItem>
                          <SelectItem value="Bank Wire Transfer">Bank Wire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" size="sm" className="w-full h-8 text-xs cursor-pointer font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600" disabled={postingPayment || !paymentAmount}>
                      {postingPayment && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                      Settle Balance Payment
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Settle Guard Warning Alert */}
            {!isSettled && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold leading-relaxed shadow-sm">
                <AlertTriangle className="size-4.5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-destructive uppercase tracking-wider text-[9px] mb-0.5">Settlement Enforcement Active</span>
                  The system prevents checking out rooms with outstanding balances. Settle the balance of <strong>{formatCurrency(balance)}</strong> before checkout can be finalized.
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 text-xs cursor-pointer">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading || !isSettled || loadingFolio}
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-bold shadow-sm"
          >
            {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Confirm Guest Check-Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
