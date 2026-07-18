import type { Booking } from "../types"
import { BookingStatusBadge } from "@/components/shared"
import { formatDate, formatShortId } from "@/utils/format"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MoreHorizontal,
  BadgeInfo,
  Edit,
  LogIn,
  LogOut,
  XCircle,
  Trash2,
} from "lucide-react"

interface DataTableProps {
  bookings: Booking[]
  onViewDetails: (booking: Booking) => void
  onEdit: (booking: Booking) => void
  onCheckIn: (booking: Booking) => void
  onCheckOut: (booking: Booking) => void
  onCancel: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  onOpenAddDialog: () => void
  role?: string
}





export function DataTable({
  bookings,
  onViewDetails,
  onEdit,
  onCheckIn,
  onCheckOut,
  onCancel,
  onDelete,
  onOpenAddDialog,
  role,
}: DataTableProps) {
  const isAdmin = role === "org:admin" || role === "Admin" || role === "ADMIN"

  return (
    <div className="border border-border bg-card rounded-xl shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[120px]">Booking ID</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[60px] text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow
                key={booking.booking_id}
                className="hover:bg-muted/10 transition-all duration-100"
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{formatShortId(booking.booking_id)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm">
                      {booking.guest_details?.full_name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {booking.guest_details?.phone_number || ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm">
                      Room {booking.room_details?.room_number || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {booking.room_details?.room_type?.toLowerCase() || ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(booking.check_in)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(booking.check_out)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {booking.adults}A {booking.children > 0 ? `${booking.children}C` : ""}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(booking.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewDetails(booking)}
                        className="cursor-pointer gap-2"
                      >
                        <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground" />
                        View Details
                      </DropdownMenuItem>

                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                        <DropdownMenuItem
                          onClick={() => onEdit(booking)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit Booking
                        </DropdownMenuItem>
                      )}

                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                        <DropdownMenuItem
                          onClick={() => onCheckIn(booking)}
                          className="cursor-pointer gap-2"
                        >
                          <LogIn className="h-3.5 w-3.5 text-emerald-500" />
                          Check-In
                        </DropdownMenuItem>
                      )}

                      {booking.status === "CHECKED_IN" && (
                        <DropdownMenuItem
                          onClick={() => onCheckOut(booking)}
                          className="cursor-pointer gap-2"
                        >
                          <LogOut className="h-3.5 w-3.5 text-blue-500" />
                          Check-Out
                        </DropdownMenuItem>
                      )}

                      {(booking.status === "PENDING" ||
                        booking.status === "CONFIRMED" ||
                        booking.status === "CHECKED_IN") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onCancel(booking)}
                            className="cursor-pointer gap-2 text-amber-600 hover:!bg-amber-500/10"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel Booking
                          </DropdownMenuItem>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(booking)}
                            className="cursor-pointer gap-2 text-destructive hover:!bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-56 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
                    <BadgeInfo className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">No bookings found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try adjusting your filters or create a new booking.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenAddDialog}
                    className="cursor-pointer"
                  >
                    Create First Booking
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
