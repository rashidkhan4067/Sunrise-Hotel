import { Link } from "react-router-dom"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { RoomStatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import type { Room } from "../types"
import { MoreHorizontal, Bed, Edit, Trash2, ShieldAlert, BadgeInfo, Plus } from "lucide-react"

interface DataTableProps {
  rooms: Room[]
  loading: boolean
  onViewDetails: (room: Room) => void
  onEdit: (room: Room) => void
  onChangeStatus: (room: Room) => void
  onDelete: (room: Room) => void
  onOpenAddDialog: () => void
}

export function DataTable({
  rooms,
  loading,
  onViewDetails,
  onEdit,
  onChangeStatus,
  onDelete,
  onOpenAddDialog,
}: DataTableProps) {
  

  const getTypeLabel = (type: string) => {
    if (!type) return "—"
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }

  return (
    <div className="border border-border bg-card rounded-xl shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30 sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[140px]">Room Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead className="text-right">Price / Night</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[80px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Skeleton loading rows
            Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-12 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-14 bg-muted rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
                <TableCell className="text-center"><div className="h-5 w-20 bg-muted rounded mx-auto" /></TableCell>
                <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded-full ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <TableRow key={room.id} className="hover:bg-muted/10 transition-all duration-100">
                <TableCell className="font-semibold text-foreground">
                  <Link 
                    to={`/admin/rooms/${room.id}`}
                    className="hover:underline flex items-center gap-2 text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-0.5"
                  >
                    <Bed className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Room {room.room_number}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getTypeLabel(room.room_type)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Floor {room.floor}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {room.capacity} {room.capacity > 1 ? "Guests" : "Guest"}
                </TableCell>
                <TableCell className="font-medium text-foreground text-right">
                  ${Number(room.price_per_night).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <RoomStatusBadge status={room.status} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" aria-label="Room Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(room)} className="cursor-pointer gap-2">
                        <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(room)} className="cursor-pointer gap-2">
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        Edit Room
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangeStatus(room)} className="cursor-pointer gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(room)} className="text-destructive cursor-pointer gap-2 hover:!bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                        Archive Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-56 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
                    <Bed className="h-5 w-5 stroke-1" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">No rooms found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your filters or register a new room.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenAddDialog}
                    className="cursor-pointer gap-1.5 mt-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Room
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
