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
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border relative pr-8">
            <div className="flex items-center justify-between gap-4">
              <BookingStatusBadge status={booking.status} className="text-xs font-semibold border-none" />
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px] sm:max-w-[200px]" title={booking.booking_id}>
                #{formatShortId(booking.booking_id)}
              </span>
            </div>
            <SheetTitle className="text-lg font-bold text-foreground pt-2">
              {booking.guest_details?.full_name || "Guest Reservation"}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Quick action drawer to manage check-ins, check-outs, or cancellations.
            </SheetDescription>
          </SheetHeader>

          {/* Booking & Guest Info details list */}
          <div className="space-y-6 py-6">
            {/* Guest Profile Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" /> Guest Contact
              </h3>
              <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/95 p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all duration-300 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-semibold text-foreground">{booking.guest_details?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="font-medium text-foreground">{booking.guest_details?.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="font-medium text-foreground">{booking.guest_details?.email || "—"}</span>
                </div>
              </div>
            </div>

            {/* Stays & Pricing Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Bed className="h-4 w-4" /> Booking Details
              </h3>
              <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/95 p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all duration-300 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Assigned</span>
                  <span className="font-semibold text-foreground">
                    Room {booking.room_details?.room_number} ({booking.room_details?.room_type})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-In Date</span>
                  <span className="font-medium text-foreground">{booking.check_in}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-Out Date</span>
                  <span className="font-medium text-foreground">{booking.check_out}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of Guests</span>
                  <span className="font-medium text-foreground">
                    {booking.adults} Adults {booking.children > 0 ? `, ${booking.children} Children` : ""}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-3 items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Total Price</span>
                  <span className="font-extrabold text-base text-primary">{formatCurrency(booking.total_price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons in Sheet Footer */}
          <SheetFooter className="border-t border-border pt-4">
            <div className="flex flex-col gap-2.5 w-full">
              {/* Primary actions (Check-In / Check-Out) */}
              {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <Button
                  onClick={onCheckIn}
                  disabled={actionLoading}
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full py-2.5 h-11 text-sm font-semibold"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  Check-In Guest
                </Button>
              )}

              {booking.status === "CHECKED_IN" && (
                <Button
                  onClick={onCheckOut}
                  disabled={actionLoading}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full py-2.5 h-11 text-sm font-semibold"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Check-Out Guest
                </Button>
              )}

              {/* Secondary actions: Edit & Cancel */}
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  disabled={actionLoading}
                  className="cursor-pointer gap-1.5 flex-1 h-10"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Button>

                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={actionLoading}
                    className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 flex-1 h-10"
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
                  className="cursor-pointer gap-1.5 w-full h-10 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Reservation
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Permanently Delete
            </DialogTitle>
            <DialogDescription className="text-sm pt-1">
              Are you sure you want to permanently delete this booking for{" "}
              <strong>{booking?.guest_details?.full_name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={actionLoading}
              className="cursor-pointer"
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
              className="cursor-pointer gap-1"
            >
              {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
