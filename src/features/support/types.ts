export type TicketCategory = "ROOM_SERVICE" | "HOUSEKEEPING" | "BILLING" | "MAINTENANCE" | "GENERAL"
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

export interface ChatMessage {
  id: string
  ticket: string
  sender?: string
  sender_role: "GUEST" | "STAFF" | "ADMIN"
  sender_name: string
  message: string
  timestamp: string
  is_read: boolean
}

export interface SupportTicket {
  id: string
  ticket_id: string
  guest: string
  guest_name?: string
  guest_email?: string
  room_number?: string | null
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  unread_count_staff?: number
  unread_count_guest?: number
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

export interface CannedResponse {
  label: string
  text: string
  category?: TicketCategory
}
