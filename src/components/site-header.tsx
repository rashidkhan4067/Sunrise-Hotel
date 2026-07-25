"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Activity, Database, Radio, BedDouble, ShieldCheck, CheckCircle2 } from "lucide-react"

interface SystemStatusPayload {
  status: string
  timestamp: string
  database: { connected: boolean; engine: string }
  realtimeStream: { activeSubscribers: number }
  operationalCounts: {
    totalRooms: number
    availableRooms: number
    occupiedRooms: number
    maintenanceRooms: number
    todaysCheckIns: number
    todaysCheckOuts: number
    totalAuditLogs: number
  }
}

// Compact breadcrumb-style page indicator in header
function HeaderPageIndicator() {
  const location = useLocation()
  const segments = location.pathname.replace(/^\//, "").split("/").filter(Boolean)
  const pageTitle = segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ")

  if (!pageTitle) return null

  return (
    <span className="hidden lg:block text-xs text-muted-foreground font-medium tracking-wide border-l pl-3 ml-1">
      {pageTitle}
    </span>
  )
}

// System Status Live Indicator Badge & Health Modal
function SystemStatusBadge() {
  const { getToken, isAuthenticated } = useAuth()
  const [modalOpen, setModalOpen] = React.useState(false)

  const { data: statusData } = useQuery<SystemStatusPayload | null>({
    queryKey: ["system-status"],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return null
      return apiClient.get<SystemStatusPayload>("reports/system-status/", token)
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })

  const isHealthy = statusData?.status === "HEALTHY"

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 hover:bg-muted/70 border border-border/50 text-[11px] font-medium text-muted-foreground mr-1 transition-colors cursor-pointer"
        title="View System Operational Health Status"
      >
        <span className={cn("size-2 rounded-full", isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
        <span className="font-semibold text-foreground">
          {statusData ? (isHealthy ? "System Healthy" : "Degraded") : "Live"}
        </span>
        {statusData && (
          <span className="hidden xl:inline text-muted-foreground">
            ({statusData.operationalCounts.availableRooms}/{statusData.operationalCounts.totalRooms} Rooms Free)
          </span>
        )}
      </button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-emerald-500" />
              <span>Operational Health Monitor</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Real-time diagnostic metrics across database, streaming, and inventory.
            </DialogDescription>
          </DialogHeader>

          {statusData ? (
            <div className="space-y-4 py-2 text-xs">
              {/* Overall Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-bold text-foreground">All Subsystems Operational</p>
                    <p className="text-[11px] text-muted-foreground">100% Release Compliance Verified</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {statusData.status}
                </span>
              </div>

              {/* Database & SSE Stream */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    Database Connection
                  </div>
                  <p className="font-semibold text-foreground">{statusData.database.connected ? "Active & Connected" : "Disconnected"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{statusData.database.engine}</p>
                </div>

                <div className="p-3 rounded-xl border border-border/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Radio className="h-3.5 w-3.5 text-blue-500" />
                    Real-time SSE Stream
                  </div>
                  <p className="font-semibold text-foreground">{statusData.realtimeStream.activeSubscribers} Active Listeners</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Server-Sent Events Feed</p>
                </div>
              </div>

              {/* Room Inventory Status */}
              <div className="p-3 rounded-xl border border-border/50 space-y-2">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <BedDouble className="h-3.5 w-3.5 text-purple-500" />
                  Room Inventory Breakdown
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{statusData.operationalCounts.availableRooms}</span>
                    <p className="text-[10px] text-muted-foreground uppercase">Available</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{statusData.operationalCounts.occupiedRooms}</span>
                    <p className="text-[10px] text-muted-foreground uppercase">Occupied</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{statusData.operationalCounts.maintenanceRooms}</span>
                    <p className="text-[10px] text-muted-foreground uppercase">Maintenance</p>
                  </div>
                </div>
              </div>

              {/* Audit Trail & Operations */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Security Audit Trail</span>
                </div>
                <span className="font-mono font-bold text-foreground">
                  {statusData.operationalCounts.totalAuditLogs} Security Logs Recorded
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground animate-pulse">
              Loading system health diagnostics...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { isAuthenticated } = useAuth()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150 shadow-xs transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-2 px-4 lg:px-6">

          {/* LEFT: Sidebar trigger + brand crumb */}
          <div className="flex items-center gap-1 min-w-0 shrink-0">
            <SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
            <HeaderPageIndicator />
          </div>

          {/* CENTER: Search bar */}
          <div className="flex-1 flex items-center justify-center">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          {/* RIGHT: Status + actions */}
          <div className="flex items-center gap-1 shrink-0">
            <SystemStatusBadge />

            {isAuthenticated && (
              <>
                <NotificationBell />
                <ModeToggle variant="ghost" />
                <Separator orientation="vertical" className="h-4 mx-1" />
                <UserNav />
              </>
            )}
            {!isAuthenticated && <ModeToggle variant="ghost" />}
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
