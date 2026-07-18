"use client"

import * as React from "react"
import { Search, X, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterOption {
  label: string
  value: string
}

export interface SelectFilter {
  id: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  options: FilterOption[]
  placeholder?: string
  triggerClassName?: string
}

interface FilterBarProps {
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
  }
  filters?: SelectFilter[]
  onReset?: () => void
  isFiltered?: boolean
  children?: React.ReactNode
  className?: string
}

export function FilterBar({
  search,
  filters = [],
  onReset,
  isFiltered = false,
  children,
  className,
}: FilterBarProps) {
  // Determine grid columns dynamically based on number of fields
  const totalItems = (search ? 1 : 0) + filters.length + (children ? 1 : 0)
  
  return (
    <div className={cn(
      "border border-border/50 bg-gradient-to-b from-card to-card/95 p-4 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-300",
      className
    )}>
      <div className="flex flex-col gap-4">
        {/* Controls Layout */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Search Input */}
          {search && (
            <div className="flex-1 min-w-[240px] space-y-1.5">
              {search.label && (
                <Label htmlFor="search-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {search.label}
                </Label>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="search-input"
                  placeholder={search.placeholder || "Search..."}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Select Dropdown Filters */}
          {filters.map((filter) => (
            <div key={filter.id} className="w-full sm:w-auto sm:min-w-[140px] space-y-1.5">
              {filter.label && (
                <Label htmlFor={filter.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {filter.label}
                </Label>
              )}
              <Select value={filter.value} onValueChange={filter.onValueChange}>
                <SelectTrigger id={filter.id} className={cn("cursor-pointer w-full", filter.triggerClassName)}>
                  <SelectValue placeholder={filter.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Custom Children Fields */}
          {children}

          {/* Reset / Actions Button */}
          {onReset && isFiltered && (
            <Button
              variant="outline"
              size="default"
              onClick={onReset}
              className="cursor-pointer gap-2 ml-auto sm:ml-0 h-10 shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
