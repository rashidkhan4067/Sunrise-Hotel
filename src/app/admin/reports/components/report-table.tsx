"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown, ChevronsUpDown, FilterX } from "lucide-react"
import type { ReportRow } from "../types"
import { formatCurrency } from "@/utils/format"

type SortKey = keyof Omit<ReportRow, never>
type SortDir = "asc" | "desc"

const PAGE_SIZE = 10

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "date", label: "Date" },
  { key: "bookings", label: "Bookings", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "checkIns", label: "Check-ins", align: "right" },
  { key: "checkOuts", label: "Check-outs", align: "right" },
  { key: "occupancyPct", label: "Occupancy %", align: "right" },
  { key: "avgStay", label: "Avg Stay", align: "right" },
]

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline ml-1 h-3 w-3 text-muted-foreground/50" />
  return sortDir === "asc"
    ? <ChevronUp className="inline ml-1 h-3 w-3" />
    : <ChevronDown className="inline ml-1 h-3 w-3" />
}

interface Props {
  rows: ReportRow[]
  loading: boolean
}

export function ReportTable({ rows, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const formatCell = (key: SortKey, row: ReportRow): string => {
    switch (key) {
      case "date":
        return row.date
      case "revenue":
        return formatCurrency(row.revenue)
      case "occupancyPct":
        return `${row.occupancyPct}%`
      case "avgStay":
        return `${row.avgStay.toFixed(1)} nights`
      default:
        return String(row[key])
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div>
          <p className="text-sm font-semibold text-foreground">Booking Statistics</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Loading..." : `${rows.length} ${rows.length === 1 ? "day" : "days"} in selected period`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={`text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap py-3 ${col.align === "right" ? "text-right" : ""}`}
                  onClick={() => handleSort(col.key)}
                  aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  {col.label}
                  <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50">
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} className={col.align === "right" ? "text-right" : ""}>
                      <Skeleton className="h-3.5 w-20 inline-block" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FilterX className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">No report data available</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your filters or selecting a different date range.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => (
                <TableRow key={row.date} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  {COLUMNS.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-3 text-sm tabular-nums ${col.align === "right" ? "text-right" : "font-medium"}`}
                    >
                      {formatCell(col.key, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {rows.length} total rows
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
