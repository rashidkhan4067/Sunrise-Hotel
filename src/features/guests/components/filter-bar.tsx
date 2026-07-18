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
  onReset: () => void
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
}: FilterBarProps) {
  const isFiltered = search !== "" || statusFilter !== "all"

  return (
    <div className="border border-border bg-card p-4 rounded-xl shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {/* Search */}
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="search-guests">Search Guests</Label>
          <SearchInput
            id="search-guests"
            placeholder="Search by Name, Phone, CNIC/Passport..."
            value={search}
            onChange={onSearchChange}
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label htmlFor="status-filter">Status</Label>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger id="status-filter" className="cursor-pointer flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

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
