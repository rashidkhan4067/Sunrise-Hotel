"use client"

import { useState } from "react"
import { cn, getInitials } from "@/lib/utils"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  KeyRound,
  Ban,
  Download,
  Search,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import type { User } from "../types"


interface DataTableProps {
  users: User[]
  onDeleteUser: (id: number | string) => void
  onEditUser: (user: User) => void
  onResetPassword: (user: User) => void
  onDeactivateUser: (user: User) => void
  onViewUser: (user: User) => void
  onOpenAddDialog: () => void
}

export function DataTable({
  users,
  onDeleteUser,
  onEditUser,
  onResetPassword,
  onDeactivateUser,
  onViewUser,
  onOpenAddDialog,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
  }

  const getRoleColor = (role: string) => {
    return role === "Admin"
      ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      : "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
  }

  const exactFilter = (row: Row<User>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const handleExportCSV = () => {
    const headers = ["Full Name", "Email", "Phone Number", "Role", "Status", "Last Login", "Created Date"]
    const rows = users.map(u => [
      u.name,
      u.email,
      u.phone || "",
      u.role,
      u.status,
      u.lastLogin || "",
      u.joinedDate || ""
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sunrise_hotel_staff_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Staff directory exported successfully!")
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Full Name",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) 
                  ? user.avatar 
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                } 
                alt={user.name} 
              />
              <AvatarFallback className="text-xs font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium truncate">{user.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
      cell: ({ row }) => <span>{row.getValue("phone") || "—"}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant="secondary" className={cn("px-2 py-0.5", getRoleColor(role))}>
            {role}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant="secondary" className={cn("px-2 py-0.5", getStatusColor(status))}>
            {status}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }) => <span>{row.getValue("lastLogin") || "Never"}</span>,
    },
    {
      accessorKey: "joinedDate",
      header: "Created Date",
      cell: ({ row }) => <span>{row.getValue("joinedDate")}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onViewUser(user)}
              title="View details"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEditUser(user)}
              title="Edit user"
            >
              <Pencil className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground">
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => onViewUser(user)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => onEditUser(user)}>
                  <Pencil className="mr-2 size-4" />
                  Edit Account
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => onResetPassword(user)}>
                  <KeyRound className="mr-2 size-4" />
                  Reset Password
                </DropdownMenuItem>
                {user.status === "Active" && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onDeactivateUser(user)}>
                    <Ban className="mr-2 size-4" />
                    Deactivate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  const roleFilter = table.getColumn("role")?.getFilterValue() as string
  const statusFilter = table.getColumn("status")?.getFilterValue() as string

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center rounded-lg border border-dashed bg-card/40">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
          <Users className="size-8" />
        </div>
        <h3 className="text-lg font-semibold">No staff members found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          Get started by adding your first hotel administrator or receptionist to the directory.
        </p>
        <Button onClick={onOpenAddDialog} className="cursor-pointer">
          Add Staff Member
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Search & Export Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff members..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={handleExportCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button onClick={onOpenAddDialog} className="cursor-pointer">
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Role & Status Filter Bars */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1 w-full max-w-[200px]">
          <Label htmlFor="role-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Role
          </Label>
          <Select
            value={roleFilter || "all"}
            onValueChange={(value) =>
              table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="role-filter">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Receptionist">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 w-full max-w-[200px]">
          <Label htmlFor="status-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Status
          </Label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 w-full max-w-[200px]">
          <Label htmlFor="column-visibility" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Columns
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
              <Button variant="outline" className="cursor-pointer w-full justify-between">
                Visible Columns <ChevronDown className="ml-2 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize cursor-pointer"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "joinedDate" ? "Created Date" : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table className="w-full min-w-[900px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No staff members found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm text-muted-foreground">
            Rows per page
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-16 cursor-pointer h-8" id="page-size">
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
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="text-sm text-muted-foreground">
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
            <strong>{table.getPageCount()}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer h-8"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
