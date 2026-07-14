"use client"

import type { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/use-app-store"
import { taskSchema } from "../data/schema"
import { toast } from "sonner"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const deleteTask = useAppStore((state) => state.deleteTask)

  const handleDelete = () => {
    try {
      const task = taskSchema.parse(row.original)
      deleteTask(task.id)
      toast.success("Task deleted successfully", {
        description: `"${task.title}" has been deleted.`,
      })
    } catch (e) {
      console.error("Failed to parse or delete task:", e)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem className="cursor-pointer">View Task</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Edit Task</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Mark as Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={handleDelete}>
          Delete
          <DropdownMenuShortcut className="text-destructive">⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
