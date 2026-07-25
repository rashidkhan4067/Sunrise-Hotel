"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, RefreshCw, Search, Clock, User, FileText, Monitor } from "lucide-react"
import { toast } from "sonner"

export interface AuditLogItem {
  id: string
  user_email: string | null
  action: string
  model_name: string | null
  object_id: string | null
  description: string
  ip_address: string | null
  timestamp: string
}

export function AuditLogsTab() {
  const { getToken } = useAuth()
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  async function fetchLogs() {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return

      const params = new URLSearchParams()
      if (actionFilter !== "all") params.append("action", actionFilter)
      if (search.trim()) params.append("search", search.trim())

      const data = await apiClient.get<AuditLogItem[]>(`/reports/audit-logs/?${params.toString()}`, token)
      setLogs(Array.isArray(data) ? data : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [actionFilter])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchLogs()
  }

  function getActionBadge(action: string) {
    switch (action) {
      case "CHECK_IN":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">Check In</Badge>
      case "CHECK_OUT":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/30">Check Out</Badge>
      case "CANCEL_BOOKING":
      case "BOOKING_DELETED":
      case "ROOM_DELETED":
      case "GUEST_DELETED":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25 border-rose-500/30">{action.replace(/_/g, " ")}</Badge>
      case "ADD_PAYMENT":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 hover:bg-purple-500/25 border-purple-500/30">Payment</Badge>
      case "ADD_CHARGE":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30">Charge</Badge>
      case "TOGGLE_CLEAN":
      case "TOGGLE_INSPECT":
        return <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/25 border-cyan-500/30">Housekeeping</Badge>
      case "STAFF_CREATED":
      case "STAFF_UPDATED":
        return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/25 border-indigo-500/30">Staff Admin</Badge>
      default:
        return <Badge variant="outline">{action.replace(/_/g, " ")}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Action Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl border border-border/60 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit descriptions, users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex gap-2 items-center">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CHECK_IN">Check In</SelectItem>
              <SelectItem value="CHECK_OUT">Check Out</SelectItem>
              <SelectItem value="CANCEL_BOOKING">Cancel Booking</SelectItem>
              <SelectItem value="CREATE_BOOKING">Create Booking</SelectItem>
              <SelectItem value="ADD_PAYMENT">Add Payment</SelectItem>
              <SelectItem value="ADD_CHARGE">Add Charge</SelectItem>
              <SelectItem value="TOGGLE_CLEAN">Toggle Clean</SelectItem>
              <SelectItem value="TOGGLE_INSPECT">Toggle Inspect</SelectItem>
              <SelectItem value="BOOKING_DELETED">Deleted Booking</SelectItem>
              <SelectItem value="ROOM_DELETED">Deleted Room</SelectItem>
              <SelectItem value="STAFF_CREATED">Staff Created</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card rounded-xl border border-border/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span>Loading security audit trail logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <ShieldAlert className="h-10 w-10 text-muted-foreground/50" />
            <div className="font-medium text-foreground">No audit logs found</div>
            <p className="text-sm max-w-sm">
              Operational activities, check-ins, check-outs, and payment actions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {log.user_email || "System"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {log.model_name ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span className="font-medium text-foreground">{log.model_name}</span>
                          {log.object_id && <span className="font-mono text-[10px] text-muted-foreground/80">({log.object_id.substring(0, 8)})</span>}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground/90 max-w-md truncate">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {log.ip_address || "Internal"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
