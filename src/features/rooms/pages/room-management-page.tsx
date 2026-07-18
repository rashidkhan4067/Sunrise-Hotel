"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"

import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { AddRoomDialog, EditRoomDialog, ChangeStatusDialog } from "../components/room-dialogs"
import type { Room } from "../types"
import type { RoomFormValues } from "../schemas"
import {
  fetchRooms,
  fetchRoomsSummary,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../api"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Download, RefreshCw, ChevronLeft, ChevronRight, Bed, CheckCircle2, KeyRound, Wrench, TrendingUp, MoreHorizontal, Edit, Trash2, ShieldAlert, BadgeInfo } from "lucide-react"
import { ErrorBanner, RoomStatusBadge, DataTable, FilterBar, type ColumnDef } from "@/components/shared"
import { toast } from "sonner"

export function RoomManagementPage() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  // Data States
  const [rooms, setRooms] = useState<Room[]>([])
  const [summary, setSummary] = useState({ total: 0, available: 0, occupied: 0, cleaning: 0, maintenance: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Filters & Sorting States
  const [search, setSearch] = useState("")
  const [floorFilter, setFloorFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("room_number")

  // Dialog States
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  // Selection
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Load Rooms & Summary Data
  const loadData = async (pageToLoad = currentPage) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (token) {
        // Fetch summary
        fetchRoomsSummary(token).then((res) => {
          if (res) setSummary(res)
        }).catch(() => {})

        // Fetch rooms list with params
        const response = await fetchRooms(token, {
          page: pageToLoad,
          page_size: pageSize,
          search: search || undefined,
          floor: floorFilter !== "all" ? floorFilter : undefined,
          room_type: typeFilter !== "all" ? typeFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          ordering: sortBy,
        })

        if (Array.isArray(response)) {
          setRooms(response)
          setTotalCount(response.length)
        } else if (response && response.results) {
          setRooms(response.results)
          setTotalCount(response.count || response.results.length)
        } else {
          setRooms([])
          setTotalCount(0)
        }
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to load rooms list")
      toast.error(err?.message || "Failed to load rooms list")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(1)
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, floorFilter, typeFilter, statusFilter, sortBy])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    loadData(newPage)
  }

  const handleResetFilters = () => {
    setSearch("")
    setFloorFilter("all")
    setTypeFilter("all")
    setStatusFilter("all")
    setSortBy("room_number")
  }

  // Handlers for CRUD operations
  const handleCreateRoom = async (values: RoomFormValues) => {
    try {
      const token = await getToken()
      if (!token) return
      await createRoom(values, token)
      toast.success("Room created successfully")
      setAddOpen(false)
      loadData(currentPage)
    } catch (err: any) {
      toast.error(err.message || "Failed to create room")
    }
  }

  const handleUpdateRoom = async (values: RoomFormValues) => {
    if (!selectedRoom) return
    try {
      const token = await getToken()
      if (!token) return
      await updateRoom(selectedRoom.id, values, token)
      toast.success("Room updated successfully")
      setEditOpen(false)
      loadData(currentPage)
    } catch (err: any) {
      toast.error(err.message || "Failed to update room")
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedRoom) return
    try {
      const token = await getToken()
      if (!token) return
      await updateRoom(selectedRoom.id, { status: newStatus }, token)
      toast.success(`Room status updated to ${newStatus}`)
      setStatusOpen(false)
      loadData(currentPage)
    } catch (err: any) {
      toast.error(err.message || "Failed to change room status")
    }
  }

  const handleArchiveRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to archive Room ${room.room_number}?`)) return
    try {
      const token = await getToken()
      if (!token) return
      await deleteRoom(room.id, token)
      toast.success(`Room ${room.room_number} archived`)
      loadData(currentPage)
    } catch (err: any) {
      toast.error(err.message || "Failed to archive room")
    }
  }

  // Calculate unique floor numbers for filter dropdown
  const floors = Array.from(new Set(rooms.map((r) => String(r.floor)))).sort((a, b) => Number(a) - Number(b))

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (rooms.length === 0) {
      toast.error("No room data to export")
      return
    }
    const headers = ["Room Number", "Type", "Floor", "Capacity", "Price Per Night", "Status"]
    const rows = rooms.map(r => [
      r.room_number,
      r.room_type,
      r.floor,
      r.capacity,
      r.price_per_night,
      r.status
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `rooms_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Rooms list exported successfully")
  }

  const getTypeLabel = (type: string) => {
    if (!type) return "—"
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }

  const columns: ColumnDef<Room>[] = [
    {
      header: "Room Number",
      className: "w-[140px]",
      cell: (room) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            <Link 
              to={`/admin/rooms/${room.id}`}
              className="hover:underline flex items-center gap-2 text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-0.5"
            >
              <Bed className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Room {room.room_number}</span>
            </Link>
          </span>
          <span className="text-xs text-muted-foreground md:hidden mt-0.5">
            {getTypeLabel(room.room_type)} · ${Number(room.price_per_night).toFixed(2)}/night
          </span>
        </div>
      ),
    },
    {
      header: "Type",
      hideOnMobile: true,
      cell: (room) => <span className="text-muted-foreground">{getTypeLabel(room.room_type)}</span>,
    },
    {
      header: "Floor",
      hideOnMobile: true,
      cell: (room) => <span className="text-muted-foreground">Floor {room.floor}</span>,
    },
    {
      header: "Capacity",
      hideOnMobile: true,
      cell: (room) => <span className="text-muted-foreground">{room.capacity} {room.capacity > 1 ? "Guests" : "Guest"}</span>,
    },
    {
      header: "Price / Night",
      className: "text-right",
      hideOnMobile: true,
      cell: (room) => <span className="font-medium text-foreground">${Number(room.price_per_night).toFixed(2)}</span>,
    },
    {
      header: "Status",
      className: "text-center",
      cell: (room) => (
        <div className="flex justify-center">
          <RoomStatusBadge status={room.status} />
        </div>
      ),
    },
    {
      header: "",
      className: "w-[80px] text-right",
      cell: (room) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" aria-label="Room Actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/rooms/${room.id}`)} className="cursor-pointer gap-2">
              <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedRoom(room)
              setEditOpen(true)
            }} className="cursor-pointer gap-2">
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              Edit Room
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedRoom(room)
              setStatusOpen(true)
            }} className="cursor-pointer gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
              Change Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleArchiveRoom(room)} className="text-destructive cursor-pointer gap-2 hover:!bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
              Archive Room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const emptyState = (
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
        onClick={() => setAddOpen(true)}
        className="cursor-pointer gap-1.5 mt-1"
      >
        <Plus className="h-4 w-4" />
        Add Room
      </Button>
    </div>
  )

  return (
    <BaseLayout
      title="Rooms"
      description="Manage hotel guest rooms, operational status, and capacity."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="cursor-pointer gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(currentPage)}
            disabled={isLoading}
            className="cursor-pointer gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        
        {/* Error notification block */}
        {error && !isLoading && (
          <ErrorBanner message={error} onRetry={() => loadData(currentPage)} />
        )}

        {/* Summary counts row using single StatCard component */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Rooms",
              value: summary.total,
              icon: Bed,
              badgeText: "100%",
              footerText: "Full catalog index",
              footerSubtext: "Active room inventory",
            },
            {
              title: "Available",
              value: summary.available,
              icon: CheckCircle2,
              badgeText: "Ready",
              footerText: "Clean & inspected",
              footerIcon: TrendingUp,
              footerSubtext: "Available for booking",
            },
            {
              title: "Occupied",
              value: summary.occupied,
              icon: KeyRound,
              badgeText: "In-House",
              footerText: "Currently checked in",
              footerIcon: TrendingUp,
              footerSubtext: "Occupied guest rooms",
            },
            {
              title: "Maintenance",
              value: summary.maintenance,
              icon: Wrench,
              badgeText: "Service",
              footerText: "Out of order",
              footerSubtext: "Engineering inspection",
            },
          ].map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        {/* Filter bar */}
        <FilterBar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search by room number or type...",
            label: "Search Rooms",
          }}
          filters={[
            {
              id: "floor",
              label: "Floor",
              value: floorFilter,
              onValueChange: setFloorFilter,
              options: [
                { label: "All Floors", value: "all" },
                ...floors.map((floor) => ({ label: `Floor ${floor}`, value: floor })),
              ],
            },
            {
              id: "type",
              label: "Type",
              value: typeFilter,
              onValueChange: setTypeFilter,
              options: [
                { label: "All Types", value: "all" },
                { label: "Single", value: "SINGLE" },
                { label: "Double", value: "DOUBLE" },
                { label: "Twin", value: "TWIN" },
                { label: "Deluxe", value: "DELUXE" },
                { label: "Suite", value: "SUITE" },
                { label: "Family", value: "FAMILY" },
              ],
            },
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onValueChange: setStatusFilter,
              options: [
                { label: "All Status", value: "all" },
                { label: "Available", value: "AVAILABLE" },
                { label: "Occupied", value: "OCCUPIED" },
                { label: "Cleaning", value: "CLEANING" },
                { label: "Maintenance", value: "MAINTENANCE" },
              ],
            },
            {
              id: "sortBy",
              label: "Sort By",
              value: sortBy,
              onValueChange: setSortBy,
              options: [
                { label: "Room Num (Low-High)", value: "room_number" },
                { label: "Room Num (High-Low)", value: "-room_number" },
                { label: "Price (Low-High)", value: "price_per_night" },
                { label: "Price (High-Low)", value: "-price_per_night" },
                { label: "Floor (Low-High)", value: "floor" },
                { label: "Floor (High-Low)", value: "-floor" },
              ],
            },
          ]}
          onReset={handleResetFilters}
          isFiltered={search !== "" || floorFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || sortBy !== "room_number"}
        />

        {/* Table representation */}
        <DataTable
          data={rooms}
          columns={columns}
          loading={isLoading}
          emptyState={emptyState}
        />

        {/* Server-Side Pagination */}
        {!isLoading && totalCount > pageSize && (
          <div className="flex items-center justify-between border-t border-border pt-4 px-2">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> rooms
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <span className="text-xs font-medium text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="cursor-pointer gap-1 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        <AddRoomDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={handleCreateRoom}
        />

        {selectedRoom && (
          <>
            <EditRoomDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              room={selectedRoom}
              onSubmit={handleUpdateRoom}
            />

            <ChangeStatusDialog
              open={statusOpen}
              onOpenChange={setStatusOpen}
              room={selectedRoom}
              onSubmit={handleChangeStatus}
            />
          </>
        )}
      </div>
    </BaseLayout>
  )
}
