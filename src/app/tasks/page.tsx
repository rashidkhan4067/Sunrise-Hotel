"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { ArrowUp, BarChart3, CheckCircle2, Clock, ListTodo, TrendingUp, TrendingDown } from "lucide-react"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { taskSchema, type Task } from "./data/schema"
import tasksData from "./data/tasks.json"
import { useAppStore } from "@/store/use-app-store"

// Use static import for tasks data (works in both Vite and Next.js)
async function getTasks() {
  return z.array(taskSchema).parse(tasksData)
}

export default function TaskPage() {
  const tasks = useAppStore((state) => state.tasks)
  const initializeTasks = useAppStore((state) => state.initializeTasks)
  const addTask = useAppStore((state) => state.addTask)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskList = await getTasks()
        if (tasks.length === 0) {
          initializeTasks(taskList)
        }
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [tasks.length, initializeTasks])

  const handleAddTask = (newTask: Task) => {
    addTask(newTask)
  }

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in progress").length,
    pending: tasks.filter(t => t.status === "pending").length,
  }

  if (loading) {
    return (
      <BaseLayout title="Tasks" description="A powerful task and issue tracker built with Tanstack Table.">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout title="Tasks" description="A powerful task and issue tracker built with Tanstack Table.">
      <div className="h-full flex-1 flex-col space-y-6 px-4 md:px-6 flex">
        {/* Stats Cards */}
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={ListTodo}
            badgeText={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
            badgeIcon={ArrowUp}
            badgeClassName="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
            footerText="Overall progress"
            footerIcon={CheckCircle2}
            footerSubtext="Task completion rate"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            badgeText={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
            badgeIcon={TrendingUp}
            badgeClassName="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
            footerText="Tasks completed"
            footerIcon={TrendingUp}
            footerSubtext="Resolved and verified"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            badgeText={`${stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%`}
            badgeIcon={Clock}
            badgeClassName="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-green-950/20 dark:text-green-400"
            footerText="Under active development"
            footerIcon={Clock}
            footerSubtext="Currently worked on"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={BarChart3}
            badgeText={`${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%`}
            badgeIcon={TrendingDown}
            badgeClassName="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-green-950/20 dark:text-green-400"
            footerText="Backlog queue"
            footerIcon={TrendingDown}
            footerSubtext="Awaiting development start"
          />
        </div>

        {/* Data Table — horizontally scrollable on mobile */}
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your project tasks in one place
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <DataTable data={tasks} columns={columns} onAddTask={handleAddTask} />
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
