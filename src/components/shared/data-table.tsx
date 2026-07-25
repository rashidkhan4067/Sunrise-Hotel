"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef as TanStackColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, Download, Search, SlidersHorizontal } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface ColumnDef<T> {
  header: React.ReactNode
  className?: string
  cell: (row: T) => React.ReactNode
  accessorKey?: keyof T | string
  id?: string
  filterFn?: any
  hideOnMobile?: boolean
}

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  columnId: string
  label: string
  options: FilterOption[]
}

interface ServerPaginationConfig {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  emptyState?: React.ReactNode
  loadingLength?: number

  // Search Config
  searchKey?: string
  searchPlaceholder?: string

  // Filters Config
  filters?: FilterConfig[]

  // Column Visibility
  showColumnVisibility?: boolean

  // Export Config
  enableExport?: boolean
  exportFilename?: string
  exportHeaders?: string[]
  exportMapper?: (row: T) => string[]

  // Pagination Config
  paginationMode?: "client" | "server" | "none"
  serverPagination?: ServerPaginationConfig
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyState,
  loadingLength = 6,
  searchKey,
  searchPlaceholder = "Search...",
  filters,
  showColumnVisibility = false,
  enableExport = false,
  exportFilename = "export",
  exportHeaders,
  exportMapper,
  paginationMode = "none",
  serverPagination,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Map simplified columns to TanStack ColumnDef format
  const tanstackColumns = React.useMemo(() => {
    return columns.map((col, idx) => {
      const colId = col.id || String(col.accessorKey || idx)
      return {
        id: colId,
        accessorKey: col.accessorKey as string,
        header: typeof col.header === "function" ? col.header : () => col.header,
        cell: ({ row }) => col.cell(row.original),
        filterFn: col.filterFn,
        meta: {
          className: cn(col.className, col.hideOnMobile && "hidden md:table-cell"),
        },
      } as TanStackColumnDef<T>
    })
  }, [columns])

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: paginationMode === "client" ? getPaginationRowModel() : undefined,
  })

  // Export CSV Handler
  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error("No records to export")
      return
    }

    let csvContent = ""

    if (exportHeaders && exportMapper) {
      const rows = data.map(exportMapper)
      csvContent =
        "data:text/csv;charset=utf-8," +
        [exportHeaders.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")
    } else {
      // Automatic export based on visible columns
      const activeHeaders = table.getFlatHeaders().filter((h) => h.column.getIsVisible() && h.id !== "actions")
      const headers = activeHeaders.map((h) => {
        const content = h.column.columnDef.header
        return typeof content === "string" ? content : h.id
      })
      const rows = table.getRowModel().rows.map((row) =>
        activeHeaders.map((h) => {
          const val = row.getValue(h.id)
          return val !== null && val !== undefined ? String(val) : ""
        })
      )
      csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${exportFilename}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV file exported successfully!")
  }

  const getColumnLabel = (id: string) => {
    const found = columns.find((c) => (c.id || c.accessorKey) === id)
    if (found && typeof found.header === "string") return found.header
    return id.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  // Determine top controls presence
  const showTopBar = searchKey || enableExport
  const showFilterBar = (filters && filters.length > 0) || showColumnVisibility

  return (
    <div className="w-full space-y-4">
      {/* Top Search & Actions Bar */}
      {showTopBar && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
          )}
          {enableExport && (
            <Button variant="outline" className="cursor-pointer ml-auto gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      {/* Advanced Filter & Visibility Controls */}
      {showFilterBar && (
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end w-full">
          {filters?.map((filter) => (
            <div key={filter.columnId} className="space-y-1.5 w-full sm:w-48">
              <Label htmlFor={filter.columnId} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {filter.label}
              </Label>
              <Select
                value={(table.getColumn(filter.columnId)?.getFilterValue() as string) || "all"}
                onValueChange={(value) =>
                  table.getColumn(filter.columnId)?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="cursor-pointer w-full" id={filter.columnId}>
                  <SelectValue placeholder={`Select ${filter.label}`} />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {showColumnVisibility && (
            <div className="space-y-1.5 w-full sm:w-48 sm:ml-auto">
              <Label htmlFor="column-visibility" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Columns
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild id="column-visibility">
                  <Button variant="outline" className="cursor-pointer w-full justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 opacity-70" />
                      Visible Columns
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {getColumnLabel(column.id)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}

      {/* Main Table Grid */}
      <div className="overflow-x-auto border border-border/50 bg-gradient-to-b from-card to-card/95 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-300">
        <Table>
          <TableHeader className="bg-muted/10 border-b border-border/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { className?: string } | undefined
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-10 text-[10px] font-bold tracking-wider text-muted-foreground uppercase py-3 whitespace-nowrap",
                        meta?.className
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: loadingLength }).map((_, rIdx) => (
                <TableRow key={rIdx} className="hover:bg-transparent animate-pulse border-b border-border/20 last:border-0">
                  {table.getVisibleFlatColumns().map((col, cIdx) => {
                    const meta = col.columnDef.meta as { className?: string } | undefined
                    return (
                      <TableCell key={cIdx} className={cn("py-3.5", meta?.className)}>
                        <div className="h-4 bg-muted/40 rounded w-16 my-0.5" />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/5 border-b border-border/15 last:border-0 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined
                    return (
                      <TableCell key={cell.id} className={cn("py-3", meta?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={tanstackColumns.length} className="h-56 text-center">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {paginationMode !== "none" && !loading && (
        <div className="flex items-center justify-between space-x-2 py-2">
          {/* Page Size Selector */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="page-size" className="text-xs text-muted-foreground">
              Rows per page
            </Label>
            {paginationMode === "server" ? (
              <Select
                value={`${serverPagination?.pageSize}`}
                onValueChange={(value) => {
                  serverPagination?.onPageSizeChange?.(Number(value))
                }}
              >
                <SelectTrigger className="w-16 cursor-pointer h-8 text-xs" id="page-size">
                  <SelectValue placeholder={serverPagination?.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-16 cursor-pointer h-8 text-xs" id="page-size">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Page Info & Controls */}
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="text-xs text-muted-foreground">
              {paginationMode === "server" ? (
                <>
                  Page <strong>{serverPagination?.currentPage}</strong> of{" "}
                  <strong>{serverPagination?.totalPages}</strong>
                </>
              ) : (
                <>
                  Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
                  <strong>{table.getPageCount()}</strong>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer h-8 text-xs"
                onClick={() => {
                  if (paginationMode === "server") {
                    serverPagination?.onPageChange(serverPagination.currentPage - 1)
                  } else {
                    table.previousPage()
                  }
                }}
                disabled={
                  paginationMode === "server"
                    ? serverPagination?.currentPage === 1
                    : !table.getCanPreviousPage()
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer h-8 text-xs"
                onClick={() => {
                  if (paginationMode === "server") {
                    serverPagination?.onPageChange(serverPagination.currentPage + 1)
                  } else {
                    table.nextPage()
                  }
                }}
                disabled={
                  paginationMode === "server"
                    ? serverPagination?.currentPage === serverPagination?.totalPages
                    : !table.getCanNextPage()
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
