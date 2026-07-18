import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchInput } from "@/components/shared"

interface FilterBarProps {
  search: string
  onSearchChange: (search: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  typeFilter: string
  onTypeFilterChange: (type: string) => void
  checkInFilter: string
  onCheckInFilterChange: (date: string) => void
  checkOutFilter: string
  onCheckOutFilterChange: (date: string) => void
  onReset: () => void
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  checkInFilter,
  onCheckInFilterChange,
  checkOutFilter,
  onCheckOutFilterChange,
  onReset,
}: FilterBarProps) {
  const isFiltered =
    search !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    checkInFilter !== "" ||
    checkOutFilter !== ""

  return (
    <div className="border border-border bg-card p-4 rounded-xl shadow-xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <Label htmlFor="search-booking">Search</Label>
          <SearchInput
            id="search-booking"
            placeholder="Guest, Room, Booking ID..."
            value={search}
            onChange={onSearchChange}
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label htmlFor="status-filter">Booking Status</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger id="status-filter" className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CHECKED_IN">Checked In</SelectItem>
              <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room Type */}
        <div className="space-y-1">
          <Label htmlFor="type-filter">Room Type</Label>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger id="type-filter" className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SINGLE">Single</SelectItem>
              <SelectItem value="DOUBLE">Double</SelectItem>
              <SelectItem value="TWIN">Twin</SelectItem>
              <SelectItem value="DELUXE">Deluxe</SelectItem>
              <SelectItem value="SUITE">Suite</SelectItem>
              <SelectItem value="FAMILY">Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Check-In Date */}
        <div className="space-y-1">
          <Label htmlFor="checkin-filter">Check-in Date</Label>
          <Input
            id="checkin-filter"
            type="date"
            className="cursor-pointer"
            value={checkInFilter}
            onChange={(e) => onCheckInFilterChange(e.target.value)}
          />
        </div>

        {/* Check-Out Date */}
        <div className="space-y-1">
          <Label htmlFor="checkout-filter">Check-out Date</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="checkout-filter"
              type="date"
              className="cursor-pointer flex-1"
              value={checkOutFilter}
              onChange={(e) => onCheckOutFilterChange(e.target.value)}
            />
            {isFiltered && (
              <Button
                variant="outline"
                size="icon"
                onClick={onReset}
                title="Reset Filters"
                className="cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
