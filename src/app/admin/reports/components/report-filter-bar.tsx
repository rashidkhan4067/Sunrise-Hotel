"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { ReportFilters, DateRangePreset, BookingStatus, RoomType, ReportType } from "../types"

interface Props {
  filters: ReportFilters
  onChange: (filters: ReportFilters) => void
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "daily", label: "Daily Report" },
  { value: "weekly", label: "Weekly Report" },
  { value: "monthly", label: "Monthly Report" },
  { value: "yearly", label: "Yearly Report" },
  { value: "revenue", label: "Revenue Report" },
  { value: "occupancy", label: "Occupancy Report" },
  { value: "booking", label: "Booking Report" },
]

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
]

const DEFAULT_FILTERS: ReportFilters = {
  reportType: "daily",
  dateRange: "this_month",
  startDate: "",
  endDate: "",
  status: "all",
  roomType: "all",
}

export function ReportFilterBar({ filters, onChange }: Props) {
  const [draft, setDraft] = useState<ReportFilters>(filters)

  // Keep draft in sync with parent filters when they are changed externally (e.g. from parent component)
  useEffect(() => {
    setDraft(filters)
  }, [filters])

  const set = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const applyFilters = () => onChange(draft)

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS)
    onChange(DEFAULT_FILTERS)
  }

  // Handle report type change - automatically set sensible defaults for date presets and trigger immediately
  const handleReportTypeChange = (type: ReportType) => {
    let preset: DateRangePreset = "this_month"
    if (type === "yearly") {
      preset = "this_year"
    } else if (type === "monthly") {
      preset = "this_year"
    } else if (type === "weekly") {
      preset = "this_month"
    }
    
    const nextFilters = {
      ...draft,
      reportType: type,
      dateRange: preset,
    }
    setDraft(nextFilters)
    onChange(nextFilters)
  }

  // Handle date preset change and trigger immediately
  const handleDatePresetChange = (preset: DateRangePreset) => {
    const nextFilters = {
      ...draft,
      dateRange: preset,
    }
    setDraft(nextFilters)
    onChange(nextFilters)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-sm">
      {/* Row 1: Report Type & Date Range Quick Presets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Report Type
          </Label>
          <Select value={draft.reportType} onValueChange={(v) => handleReportTypeChange(v as ReportType)}>
            <SelectTrigger className="h-9 w-full text-sm" aria-label="Select report type">
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Date Range
          </Label>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((p) => (
              <Button
                key={p.value}
                variant={draft.dateRange === p.value ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => handleDatePresetChange(p.value)}
                aria-pressed={draft.dateRange === p.value}
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant={draft.dateRange === "custom" ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => handleDatePresetChange("custom")}
              aria-pressed={draft.dateRange === "custom"}
            >
              Custom Range
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Date Inputs if "custom" range is selected */}
      {draft.dateRange === "custom" && (
        <div className="flex flex-wrap gap-4 items-end animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <Label htmlFor="start-date" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="start-date"
              type="date"
              value={draft.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="h-9 text-sm w-44"
              aria-label="Start date"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-date" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="end-date"
              type="date"
              value={draft.endDate}
              min={draft.startDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="h-9 text-sm w-44"
              aria-label="End date"
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Row 2: Status, Room Type Filters & Actions */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={draft.status} onValueChange={(v) => set("status", v as BookingStatus)}>
            <SelectTrigger className="h-9 w-48 text-sm" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="checked_out">Checked Out</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Room Type</Label>
          <Select value={draft.roomType} onValueChange={(v) => set("roomType", v as RoomType)}>
            <SelectTrigger className="h-9 w-48 text-sm" aria-label="Filter by room type">
              <SelectValue placeholder="All room types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={resetFilters}
            aria-label="Reset all filters"
          >
            Reset
          </Button>
          <Button
            size="sm"
            className="h-9 text-xs"
            onClick={applyFilters}
            aria-label="Apply filters"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
