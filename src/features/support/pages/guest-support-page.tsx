"use client"

import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, UtensilsCrossed, Wrench, Receipt } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { fetchSupportTickets, createSupportTicket, sendChatMessage, type SupportTicket } from "../api"
import { TicketList } from "../components/ticket-list"
import { ChatThread } from "../components/chat-thread"
import { NewTicketDialog } from "../components/new-ticket-dialog"
import { toast } from "sonner"

export function GuestSupportPage() {
  const { getToken } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")

  async function loadTickets() {
    try {
      const token = await getToken()
      if (!token) return
      const data = await fetchSupportTickets(token)
      setTickets(data)
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0])
      } else if (selectedTicket) {
        const refreshed = data.find((t) => t.id === selectedTicket.id)
        if (refreshed) setSelectedTicket(refreshed)
      }
    } catch (err: any) {
      console.error("Error fetching support tickets", err)
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
  }, [getToken])

  async function handleSendMessage(text: string) {
    if (!selectedTicket) return
    const token = await getToken()
    if (!token) return
    await sendChatMessage(token, selectedTicket.id, text)
    loadTickets()
  }

  async function handleCreateTicket(data: { subject: string; category: string; priority: string; initial_message: string }) {
    const token = await getToken()
    if (!token) return
    const created = await createSupportTicket(token, data)
    toast.success("In-house request submitted successfully!")
    setSelectedTicket(created)
    setMobileView("chat")
    loadTickets()
  }

  const quickTiles = [
    {
      title: "Extra Towels & Water",
      category: "HOUSEKEEPING",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
      subject: "Request: Extra Towels & Water Bottles",
      initial: "Hello reception, could you please deliver extra bath towels and bottled water to my room?",
    },
    {
      title: "In-Room Dining Request",
      category: "ROOM_SERVICE",
      icon: UtensilsCrossed,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
      subject: "Room Service Dining Assistance",
      initial: "Hi! I would like assistance with ordering room service dining.",
    },
    {
      title: "AC & Appliance Check",
      category: "MAINTENANCE",
      icon: Wrench,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/30",
      subject: "Maintenance Request: In-Room Appliance",
      initial: "Hello, someone please check the climate control / AC unit in my room.",
    },
    {
      title: "Folio & Invoice Details",
      category: "BILLING",
      icon: Receipt,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
      subject: "Folio Invoice Statement Inquiry",
      initial: "Hi reception, please send me an updated copy of my stay billing invoice statement.",
    },
  ]

  return (
    <BaseLayout
      role="guest"
      title="Guest Concierge & Live Support Desk"
      description="Instant 24/7 direct communication with hotel reception for housekeeping, room service, or stay assistance."
      actions={
        <Button
          onClick={() => setDialogOpen(true)}
          className="cursor-pointer bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-xs"
        >
          <Plus className="size-3.5" />
          New Request
        </Button>
      }
    >
      <div className="px-4 lg:px-6 space-y-5 max-w-6xl">
        {/* Quick One-Tap Request Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <div
                key={tile.title}
                onClick={() =>
                  handleCreateTicket({
                    subject: tile.subject,
                    category: tile.category,
                    priority: "MEDIUM",
                    initial_message: tile.initial,
                  })
                }
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer shadow-2xs flex flex-col justify-between group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${tile.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <Plus className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{tile.title}</h4>
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{tile.category.replace("_", " ")}</p>
                </div>
              </div>
            )
          })}
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
              role="guest"
            />
          </div>

          <div className={`lg:col-span-2 ${mobileView === "list" ? "hidden lg:block" : "block"}`}>
            <ChatThread
              ticket={selectedTicket}
              role="guest"
              onSendMessage={handleSendMessage}
              onBackToList={() => setMobileView("list")}
            />
          </div>
        </div>
      </div>

      <NewTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateTicket}
      />
    </BaseLayout>
  )
}
