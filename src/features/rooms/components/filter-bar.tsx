import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RotateCcw } from "lucide-react"
import { SearchInput } from "@/components/shared"

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  floorFilter: string
  onFloorFilterChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  floors: string[]
  onReset: () => void
}

export function FilterBar({
  search,
  onSearchChange,
  floorFilter,
  onFloorFilterChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  floors,
  onReset,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-card p-4 rounded-xl border border-border shadow-xs">
      <SearchInput
        placeholder="Search by room number or type..."
        value={search}
        onChange={onSearchChange}
        className="flex-1 max-w-md"
      />
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Floor:</span>
          <Select value={floorFilter} onValueChange={onFloorFilterChange}>
            <SelectTrigger className="w-[115px] cursor-pointer">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor} value={floor}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Type:</span>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-[130px] cursor-pointer">
              <SelectValue placeholder="All Types" />
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Status:</span>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[135px] cursor-pointer">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Sort By:</span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[155px] cursor-pointer">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="room_number">Room Num (Low-High)</SelectItem>
              <SelectItem value="-room_number">Room Num (High-Low)</SelectItem>
              <SelectItem value="price_per_night">Price (Low-High)</SelectItem>
              <SelectItem value="-price_per_night">Price (High-Low)</SelectItem>
              <SelectItem value="floor">Floor (Low-High)</SelectItem>
              <SelectItem value="-floor">Floor (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
          className="gap-1 cursor-pointer h-9 px-3 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
