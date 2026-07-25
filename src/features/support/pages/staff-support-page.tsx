"use client"

import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { fetchSupportTickets, updateTicketStatus, sendChatMessage, type SupportTicket } from "../api"
import { SupportKpiBar } from "../components/support-kpi-bar"
import { TicketList } from "../components/ticket-list"
import { ChatThread } from "../components/chat-thread"
import { toast } from "sonner"

interface StaffSupportPageProps {
  role?: "staff" | "admin"
}

export function StaffSupportPage({ role = "staff" }: StaffSupportPageProps) {
  const { getToken } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")

  async function loadTickets() {
    try {
      const token = await getToken()
      if (!token) return
      const statusArg = filterStatus === "ALL" ? undefined : filterStatus
      const data = await fetchSupportTickets(token, statusArg)
      setTickets(data)
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0])
      } else if (selectedTicket) {
        const refreshed = data.find((t) => t.id === selectedTicket.id)
        if (refreshed) setSelectedTicket(refreshed)
      }
    } catch (err: any) {
      console.error("Error loading staff support tickets", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadTickets()
    const interval = setInterval(() => {
      loadTickets()
    }, 3500)
    return () => clearInterval(interval)
  }, [getToken, filterStatus])

  async function handleSendMessage(text: string) {
    if (!selectedTicket) return
    const token = await getToken()
    if (!token) return
    await sendChatMessage(token, selectedTicket.id, text)
    loadTickets()
  }

  async function handleStatusChange(status: string) {
    if (!selectedTicket) return
    const token = await getToken()
    if (!token) return
    await updateTicketStatus(token, selectedTicket.id, status)
    toast.success(`Ticket status updated to ${status.replace("_", " ")}`)
    loadTickets()
  }

  return (
    <BaseLayout
      title="Reception Desk & Live Guest Support Console"
      description="Real-time guest inquiry dispatcher, room service requests, and live chat thread manager."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadTickets()}
          className="cursor-pointer text-xs gap-1.5 h-8 font-bold"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Feed
        </Button>
      }
    >
      <div className="px-4 lg:px-6 space-y-5 max-w-7xl">
        {/* Executive / Staff Operational KPI Bar */}
        <SupportKpiBar tickets={tickets} />

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-card p-2 rounded-xl border border-border shadow-2xs">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <Button
              key={st}
              variant={filterStatus === st ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus(st)}
              className="text-xs h-7 px-3 cursor-pointer capitalize font-bold rounded-lg shrink-0"
            >
              {st.replace("_", " ")}
            </Button>
          ))}
        </div>

        {/* Master Workspace - Split Pane Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${mobileView === "chat" ? "hidden lg:block" : "block"}`}>
            <TicketList
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={(t) => {
                setSelectedTicket(t)
                setMobileView("chat")
              }}
              loading={loading}
              role={role}
            />
          </div>

          <div className={`lg:col-span-2 ${mobileView === "list" ? "hidden lg:block" : "block"}`}>
            <ChatThread
              ticket={selectedTicket}
              role={role}
              onSendMessage={handleSendMessage}
              onStatusChange={handleStatusChange}
              onBackToList={() => setMobileView("list")}
            />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
