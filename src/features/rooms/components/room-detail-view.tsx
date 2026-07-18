import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { RoomStatusBadge } from "@/components/shared"
import type { Room } from "../types"
import { Bed, Users, DollarSign, Calendar, ClipboardList } from "lucide-react"

interface RoomDetailViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function RoomDetailView({ open, onOpenChange, room }: RoomDetailViewProps) {

  const amenitiesList = room?.amenities
    ? room.amenities.split(",").map((a) => a.trim()).filter(Boolean)
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Bed className="h-5 w-5 text-primary" />
            Room {room?.room_number} Details
          </DialogTitle>
        </DialogHeader>

        {room && (
          <div className="space-y-6 pt-4 text-sm">
            {/* Room Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Room Type</span>
                <span className="font-semibold text-foreground text-sm">{room.room_type}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Floor</span>
                <span className="font-semibold text-foreground text-sm">Floor {room.floor}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Capacity</span>
                <span className="font-semibold text-foreground text-sm flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {room.capacity} {room.capacity > 1 ? "Guests" : "Guest"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Price / Night</span>
                <span className="font-semibold text-foreground text-sm flex items-center">
                  <DollarSign className="h-3.5 w-3.5" />
                  {Number(room.price_per_night).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Description & Amenities */}
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground font-semibold mr-2">Status:</span>
                <RoomStatusBadge status={room.status} />
              </div>
              {room.description && (
                <div>
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">{room.description}</p>
                </div>
              )}
              {amenitiesList.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1.5">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity, idx) => (
                      <span key={idx} className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium border border-border">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Booking Info (If Occupied / Booked Today) */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Current Occupation
              </h4>
              {room.current_booking ? (
                <div className="p-4 border rounded-xl bg-primary/5 border-primary/20 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-muted-foreground block">Active Guest</span>
                      <span className="font-semibold text-foreground">{room.current_booking.guest.name}</span>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        {room.current_booking.guest.phone} {room.current_booking.guest.email && `| ${room.current_booking.guest.email}`}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary capitalize">
                      {room.current_booking.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-2 mt-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block font-medium">Check-In</span>
                      <span className="text-foreground font-medium">{room.current_booking.check_in}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Check-Out</span>
                      <span className="text-foreground font-medium">{room.current_booking.check_out}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">No guest currently occupying this room.</p>
              )}
            </div>

            {/* Booking History */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-primary" />
                Recent Booking History
              </h4>
              {room.booking_history && room.booking_history.length > 0 ? (
                <div className="border rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-muted/40 p-2.5 font-semibold border-b text-muted-foreground uppercase text-[10px]">
                    <div>Guest</div>
                    <div>Period</div>
                    <div>Status</div>
                    <div className="text-right">Price</div>
                  </div>
                  <div className="divide-y max-h-40 overflow-y-auto">
                    {room.booking_history.map((hist) => (
                      <div key={hist.id} className="grid grid-cols-4 p-2.5 items-center">
                        <div className="font-medium text-foreground truncate">{hist.guest_name}</div>
                        <div className="text-muted-foreground truncate">{hist.check_in} to {hist.check_out}</div>
                        <div className="capitalize truncate text-muted-foreground">
                          {hist.status.toLowerCase().replace("_", " ")}
                        </div>
                        <div className="text-right font-medium text-foreground">${hist.total_price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">No historical booking records found.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
