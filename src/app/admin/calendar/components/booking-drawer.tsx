"use client"

import { useState } from "react"
import {
  User,
  Bed,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  Users,
  CreditCard,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Booking } from "@/features/bookings/types"
import { BookingStatusBadge } from "@/components/shared"
import { formatShortId, formatCurrency } from "@/utils/format"

interface BookingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  actionLoading: boolean
  onCheckIn: () => Promise<void>
  onCheckOut: () => Promise<void>
  onCancel: () => Promise<void>
  onDelete: () => Promise<void>
  onEdit: () => void
  isAdmin: boolean
}

export function BookingDrawer({
  open,
  onOpenChange,
  booking,
  actionLoading,
  onCheckIn,
  onCheckOut,
  onCancel,
  onDelete,
  onEdit,
  isAdmin,
}: BookingDrawerProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  if (!booking) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto p-6 space-y-6">
          
          {/* Header (Cleanly separated from close X button) */}
          <SheetHeader className="pb-4 border-b border-border/50 space-y-2 pr-10 text-left">
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.status} className="text-xs font-bold px-2.5 py-0.5 border-none shadow-none" />
              <span className="text-xs text-muted-foreground font-mono font-semibold bg-muted/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Hash className="h-3 w-3 text-muted-foreground/70" />
                {formatShortId(booking.booking_id)}
              </span>
            </div>

            <SheetTitle className="text-xl font-extrabold text-foreground tracking-tight pt-1">
              {booking.guest_details?.full_name || "Guest Reservation"}
            </SheetTitle>

            <SheetDescription className="text-xs text-muted-foreground">
              Manage reservation stay actions, guest contacts, and folio charges.
            </SheetDescription>
          </SheetHeader>

          {/* Details Body */}
          <div className="space-y-5">
            {/* Guest Contact Details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                <span>Guest Contact Profile</span>
              </h4>
              
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Full Name</span>
                  <span className="font-bold text-foreground">{booking.guest_details?.full_name || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </span>
                  <span className="font-mono font-semibold text-foreground">{booking.guest_details?.phone_number || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[200px]" title={booking.guest_details?.email || undefined}>
                    {booking.guest_details?.email || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Stay Details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-primary" />
                <span>Booking & Room Information</span>
              </h4>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Assigned Room</span>
                  <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    Room {booking.room_details?.room_number} ({booking.room_details?.room_type})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Check-In
                  </span>
                  <span className="font-mono font-bold text-foreground">{booking.check_in}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Check-Out
                  </span>
                  <span className="font-mono font-bold text-foreground">{booking.check_out}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" /> Guests
                  </span>
                  <span className="font-semibold text-foreground">
                    {booking.adults} Adults {booking.children > 0 ? `, ${booking.children} Children` : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-primary" /> Total Price
                  </span>
                  <span className="text-lg font-black text-primary">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons in Sheet Footer */}
          <SheetFooter className="border-t border-border/50 pt-4 mt-2">
            <div className="flex flex-col gap-2 w-full">
              {/* Primary Actions: Check-In / Check-Out */}
              {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <Button
                  onClick={onCheckIn}
                  disabled={actionLoading}
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 w-full h-10 text-xs shadow-xs"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  Check-In Guest
                </Button>
              )}

              {booking.status === "CHECKED_IN" && (
                <Button
                  onClick={onCheckOut}
                  disabled={actionLoading}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 w-full h-10 text-xs shadow-xs"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Check-Out Guest
                </Button>
              )}

              {/* Secondary Actions: Edit & Cancel */}
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  disabled={actionLoading}
                  className="cursor-pointer gap-1.5 flex-1 h-9 text-xs font-semibold"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Details
                </Button>

                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={actionLoading}
                    className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex-1 h-9 text-xs font-semibold"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>

              {/* Delete Action (Admin Only) */}
              {isAdmin && (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={actionLoading}
                  className="cursor-pointer gap-1.5 w-full h-9 text-xs font-bold mt-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Reservation
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-base font-bold">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Permanently Delete
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Are you sure you want to permanently delete this booking for{" "}
              <strong className="text-foreground">{booking?.guest_details?.full_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={actionLoading}
              className="cursor-pointer text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onDelete()
                setDeleteConfirmOpen(false)
              }}
              disabled={actionLoading}
              className="cursor-pointer gap-1 text-xs h-8 font-bold"
            >
              {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
