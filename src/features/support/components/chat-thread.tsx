import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send, 
  User, 
  Bed, 
  Check, 
  RotateCcw, 
  Loader2, 
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Building2,
  Clock
} from "lucide-react"
import { TicketStatusBadge, TicketPriorityBadge } from "./ticket-status-badge"
import { CannedResponses } from "./canned-responses"
import type { SupportTicket } from "../types"

interface ChatThreadProps {
  ticket: SupportTicket | null
  role: "guest" | "staff" | "admin"
  onSendMessage: (text: string) => Promise<void>
  onStatusChange?: (status: string) => Promise<void>
  onBackToList?: () => void
}

export function ChatThread({
  ticket,
  role,
  onSendMessage,
  onStatusChange,
  onBackToList,
}: ChatThreadProps) {
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const userJustSentRef = useRef<boolean>(false)
  const prevMessagesLengthRef = useRef<number>(0)
  
  const isStaff = role === "staff" || role === "admin"

  // Smart scroll control: ONLY scroll to bottom if user is at bottom OR just posted a message
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !ticket?.messages) return

    const messageCount = ticket.messages.length
    const hasNewMessage = messageCount > prevMessagesLengthRef.current
    prevMessagesLengthRef.current = messageCount

    if (userJustSentRef.current || (!isUserScrolledUp && hasNewMessage)) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
      userJustSentRef.current = false
    }
  }, [ticket?.messages, isUserScrolledUp])

  // Scroll position listener
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    setIsUserScrolledUp(distanceFromBottom > 100)
  }

  const scrollToBottom = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
      setIsUserScrolledUp(false)
    }
  }

  async function handleSend(e?: React.FormEvent, overrideText?: string) {
    if (e) e.preventDefault()
    const text = overrideText || input
    if (!text.trim() || !ticket || sending) return

    userJustSentRef.current = true
    setSending(true)
    try {
      await onSendMessage(text.trim())
      setInput("")
    } finally {
      setSending(false)
    }
  }

  if (!ticket) {
    return (
      <Card className="border-border/80 shadow-md bg-card/60 backdrop-blur-md flex flex-col items-center justify-center h-[620px] w-full text-center p-8 text-muted-foreground space-y-3">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <MessageSquare className="size-8" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground">No Inquiry Selected</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
            Select a support request from the feed or submit a new ticket to open live concierge messaging.
          </p>
        </div>
      </Card>
    )
  }

  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED"

  return (
    <Card className="border-border/80 shadow-md bg-card/80 backdrop-blur-md flex flex-col h-[620px] w-full overflow-hidden transition-all">
      {/* Context Ribbon Header */}
      <CardHeader className="p-4 border-b border-border/80 space-y-3 bg-gradient-to-r from-card via-card to-muted/20">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToList && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackToList}
                className="lg:hidden size-8 shrink-0 cursor-pointer rounded-lg hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">
                  {ticket.ticket_id}
                </span>
                <TicketStatusBadge status={ticket.status} />
                {isStaff && <TicketPriorityBadge priority={ticket.priority} />}
              </div>
              <CardTitle className="text-base font-black text-foreground line-clamp-1 tracking-tight">
                {ticket.subject}
              </CardTitle>
            </div>
          </div>

          {onStatusChange && (
            <div className="flex items-center gap-2 shrink-0">
              {!isResolved ? (
                <Button
                  size="sm"
                  onClick={() => onStatusChange("RESOLVED")}
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 shadow-xs gap-1.5 transition-all"
                >
                  <Check className="size-3.5 stroke-[3]" />
                  Mark Resolved
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange("OPEN")}
                  className="cursor-pointer text-xs h-8 px-3 gap-1.5 border-border hover:bg-muted font-bold"
                >
                  <RotateCcw className="size-3.5" />
                  Re-Open
                </Button>
              )}
            </div>
          )}
        </div>

        {/* User Stay Metadata Strip */}
        <div className="flex items-center gap-3 text-xs bg-muted/40 px-3 py-2 rounded-xl border border-border/50 text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <User className="size-3.5 text-primary shrink-0" />
            {ticket.guest_name || ticket.guest_email}
          </span>
          <span className="text-border">•</span>
          {ticket.room_number ? (
            <span className="flex items-center gap-1.5 font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <Bed className="size-3.5" />
              Room {ticket.room_number}
            </span>
          ) : (
            <span className="italic text-muted-foreground">No active room check-in</span>
          )}
          <span className="text-border">•</span>
          <span className="capitalize font-semibold text-foreground flex items-center gap-1">
            <Building2 className="size-3 text-muted-foreground" />
            {ticket.category.replace("_", " ")}
          </span>
        </div>
      </CardHeader>

      {/* Messages Feed Container */}
      <div className="relative flex-1 overflow-hidden bg-muted/15 flex flex-col">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-4 overflow-y-auto space-y-4 flex-1 scroll-smooth"
        >
          {(!ticket.messages || ticket.messages.length === 0) ? (
            <div className="py-16 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-2">
              <Clock className="size-6 text-muted-foreground/50" />
              No messages recorded in thread yet.
            </div>
          ) : (
            ticket.messages.map((m) => {
              const senderIsStaff = m.sender_role === "STAFF" || m.sender_role === "ADMIN"
              const isSelf = isStaff ? senderIsStaff : !senderIsStaff

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 font-medium">
                    {senderIsStaff ? (
                      <ShieldCheck className="size-3 text-primary shrink-0" />
                    ) : (
                      <User className="size-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-bold text-foreground">
                      {senderIsStaff ? "Reception Desk" : (m.sender_name || "Guest")}
                    </span>
                    <span>•</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all shadow-xs ${
                      isSelf
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium rounded-tr-xs"
                        : "bg-card text-foreground border border-border/70 rounded-tl-xs shadow-2xs"
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Floating "Scroll to Bottom" indicator when user scrolls up */}
        {isUserScrolledUp && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-3 right-4 bg-primary text-primary-foreground font-bold text-[11px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer border border-primary-foreground/20 animate-bounce"
          >
            <ChevronDown className="size-3.5" />
            <span>Latest Messages</span>
          </button>
        )}
      </div>

      {/* Footer Controls & Input */}
      <CardFooter className="p-3 border-t border-border/80 bg-card flex flex-col gap-2.5">
        {isStaff && !isResolved && (
          <CannedResponses onSelect={(text) => handleSend(undefined, text)} disabled={sending} />
        )}

        <form onSubmit={(e) => handleSend(e)} className="flex gap-2 w-full">
          <Input
            placeholder={
              isResolved
                ? "This ticket is resolved. Click 'Re-Open' above to post messages."
                : isStaff
                ? "Type official staff response..."
                : "Type your message to hotel reception staff..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending || isResolved}
            className="text-xs h-10 bg-muted/20 border-border/80 focus-visible:ring-primary font-medium"
          />
          <Button
            type="submit"
            disabled={sending || !input.trim() || isResolved}
            className="cursor-pointer bg-primary text-primary-foreground font-bold h-10 px-4 shrink-0 gap-1.5 text-xs shadow-xs hover:opacity-90 transition-all"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
