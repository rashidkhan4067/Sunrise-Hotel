import { apiClient } from "@/lib/api-client"
import type { SupportTicket, ChatMessage } from "./types"
import { IS_DEMO_MODE, demoDelay } from "@/lib/demo-data"

export * from "./types"

const DEMO_TICKETS: SupportTicket[] = [
  {
    id: "1",
    ticket_id: "TKT-0001",
    guest: "demo-guest-001",
    guest_name: "Usman Farooq",
    guest_email: "guest@sunrise.com",
    room_number: "101",
    subject: "Room cleaning not done",
    category: "HOUSEKEEPING",
    priority: "MEDIUM",
    status: "OPEN",
    unread_count_staff: 1,
    unread_count_guest: 0,
    created_at: "2026-08-04T10:00:00Z",
    updated_at: "2026-08-04T10:00:00Z",
    messages: [
      {
        id: "msg-1",
        ticket: "1",
        sender: "demo-guest-001",
        sender_role: "GUEST",
        sender_name: "Usman Farooq",
        message: "The room has not been cleaned since check-in. Could you please send someone?",
        timestamp: "2026-08-04T10:00:00Z",
        is_read: false,
      },
    ],
  },
  {
    id: "2",
    ticket_id: "TKT-0002",
    guest: "demo-guest-001",
    guest_name: "Usman Farooq",
    guest_email: "guest@sunrise.com",
    room_number: null,
    subject: "Billing enquiry for previous stay",
    category: "BILLING",
    priority: "LOW",
    status: "RESOLVED",
    unread_count_staff: 0,
    unread_count_guest: 0,
    created_at: "2026-07-05T09:00:00Z",
    updated_at: "2026-07-06T14:00:00Z",
    messages: [
      {
        id: "msg-2",
        ticket: "2",
        sender: "demo-guest-001",
        sender_role: "GUEST",
        sender_name: "Usman Farooq",
        message: "Could you clarify the extra charge on my invoice?",
        timestamp: "2026-07-05T09:00:00Z",
        is_read: true,
      },
      {
        id: "msg-3",
        ticket: "2",
        sender_role: "STAFF",
        sender_name: "Sara Malik",
        message: "The extra charge was for minibar usage. I've sent a detailed receipt to your email.",
        timestamp: "2026-07-06T14:00:00Z",
        is_read: true,
      },
    ],
  },
]

export async function fetchSupportTickets(token: string, status?: string): Promise<SupportTicket[]> {
  if (IS_DEMO_MODE) {
    const filtered = status ? DEMO_TICKETS.filter((t) => t.status === status) : DEMO_TICKETS
    return demoDelay(filtered)
  }
  const query = status ? `?status=${status}` : ""
  const data = await apiClient.get<{ tickets: SupportTicket[] }>(`support/tickets/${query}`, token)
  return data.tickets || []
}

export async function createSupportTicket(
  token: string,
  ticketData: { subject: string; category: string; priority?: string; initial_message?: string }
): Promise<SupportTicket> {
  if (IS_DEMO_MODE) {
    const newTicket: SupportTicket = {
      id: String(Date.now()),
      ticket_id: `TKT-DEMO-${Date.now()}`,
      guest: "demo-guest-001",
      guest_name: "Usman Farooq",
      guest_email: "guest@sunrise.com",
      room_number: null,
      subject: ticketData.subject,
      category: ticketData.category as any,
      priority: (ticketData.priority as any) || "MEDIUM",
      status: "OPEN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: ticketData.initial_message
        ? [{ id: "new-msg", ticket: "new", sender_role: "GUEST", sender_name: "Usman Farooq", message: ticketData.initial_message, timestamp: new Date().toISOString(), is_read: false }]
        : [],
    }
    return demoDelay(newTicket)
  }
  return apiClient.post<SupportTicket>("support/tickets/", ticketData, token)
}

export async function fetchTicketDetails(token: string, id: string): Promise<SupportTicket> {
  if (IS_DEMO_MODE) {
    const found = DEMO_TICKETS.find((t) => t.id === id)
    return demoDelay(found as SupportTicket)
  }
  return apiClient.get<SupportTicket>(`support/tickets/${id}/`, token)
}

export async function updateTicketStatus(
  token: string,
  id: string,
  status: string
): Promise<SupportTicket> {
  if (IS_DEMO_MODE) {
    const found = DEMO_TICKETS.find((t) => t.id === id)
    return demoDelay({ ...(found as SupportTicket), status: status as any })
  }
  return apiClient.patch<SupportTicket>(`support/tickets/${id}/`, { status }, token)
}

export async function sendChatMessage(
  token: string,
  ticketId: string,
  message: string
): Promise<ChatMessage> {
  if (IS_DEMO_MODE) {
    return demoDelay({
      id: `msg-${Date.now()}`,
      ticket: ticketId,
      sender_role: "GUEST",
      sender_name: "Usman Farooq",
      message,
      timestamp: new Date().toISOString(),
      is_read: false,
    })
  }
  return apiClient.post<ChatMessage>(`support/tickets/${ticketId}/messages/`, { message }, token)
}
