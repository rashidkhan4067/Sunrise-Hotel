"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { categories, priorities, statuses } from "../data/data"
import type { Task } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => (
      <div className="w-[90px] font-medium">{row.getValue("id")}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const category = categories.find(
        (cat) => cat.value === row.original.category
      )
      const status = statuses.find(
        (status) => status.value === row.original.status
      )
      const priority = priorities.find(
        (priority) => priority.value === row.original.priority
      )

      const priorityColors = {
        critical: "border-red-700 text-red-700 dark:text-red-400",
        important: "border-orange-500 text-orange-700 dark:text-orange-400",
        normal: "border-blue-500 text-blue-700 dark:text-blue-400",
        minor: "border-gray-500 text-gray-700 dark:text-gray-400",
      }

      return (
        <div className="flex flex-col items-start gap-1">
          <span className="max-w-[500px] font-medium text-foreground whitespace-normal break-words">
            {row.getValue("title")}
          </span>
          <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground md:hidden">
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
              {row.original.id}
            </span>
            {category && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-normal bg-background shrink-0">
                {category.label}
              </Badge>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 px-1 py-0 h-4 text-[10px] border rounded bg-background shrink-0">
                {status.icon && <status.icon className="size-2.5 shrink-0" />}
                {status.label}
              </span>
            )}
            {priority && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 font-normal bg-background shrink-0",
                  priorityColors[priority.value as keyof typeof priorityColors]
                )}
              >
                {priority.label}
              </Badge>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = categories.find(
        (cat) => cat.value === row.getValue("category")
      )

      if (!category) {
        return null
      }

      return (
        <div className="flex w-[120px] items-center">
          <Badge variant="outline">
            {category.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[130px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm">{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority")
      )

      if (!priority) {
        return null
      }

      const priorityColors = {
        critical: "border-red-700 text-red-700 dark:text-red-400",
        important: "border-orange-500 text-orange-700 dark:text-orange-400",
        normal: "border-blue-500 text-blue-700 dark:text-blue-400",
        minor: "border-gray-500 text-gray-700 dark:text-gray-400",
      }

      return (
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={cn(
              "pl-2",
              priorityColors[priority.value as keyof typeof priorityColors]
            )}
          >
            <span className="text-sm">{priority.label}</span>
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
