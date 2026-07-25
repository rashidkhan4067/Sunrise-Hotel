import { apiClient } from "@/lib/api-client"
import type { SupportTicket, ChatMessage } from "./types"

export * from "./types"

export async function fetchSupportTickets(token: string, status?: string): Promise<SupportTicket[]> {
  const query = status ? `?status=${status}` : ""
  const data = await apiClient.get<{ tickets: SupportTicket[] }>(`support/tickets/${query}`, token)
  return data.tickets || []
}

export async function createSupportTicket(
  token: string,
  ticketData: { subject: string; category: string; priority?: string; initial_message?: string }
): Promise<SupportTicket> {
  return apiClient.post<SupportTicket>("support/tickets/", ticketData, token)
}

export async function fetchTicketDetails(token: string, id: string): Promise<SupportTicket> {
  return apiClient.get<SupportTicket>(`support/tickets/${id}/`, token)
}

export async function updateTicketStatus(
  token: string,
  id: string,
  status: string
): Promise<SupportTicket> {
  return apiClient.patch<SupportTicket>(`support/tickets/${id}/`, { status }, token)
}

export async function sendChatMessage(
  token: string,
  ticketId: string,
  message: string
): Promise<ChatMessage> {
  return apiClient.post<ChatMessage>(`support/tickets/${ticketId}/messages/`, { message }, token)
}
