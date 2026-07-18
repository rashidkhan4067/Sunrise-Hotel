import { apiClient } from "@/lib/api-client"

export async function fetchGuests(token: string) {
  const data = await apiClient.get<any>("/guests/", token)
  return Array.isArray(data) ? data : (data.results || [])
}

export async function fetchGuest(id: string | number, token: string) {
  return apiClient.get<any>(`/guests/${id}/`, token)
}

export async function createGuest(data: any, token: string) {
  return apiClient.post<any>("/guests/", data, token)
}

export async function updateGuest(id: string | number, data: any, token: string) {
  return apiClient.patch<any>(`/guests/${id}/`, data, token)
}

export async function deleteGuest(id: string | number, token: string) {
  return apiClient.delete<boolean>(`/guests/${id}/`, token)
}

export async function fetchGuestBookings(guestId: string | number, token: string) {
  const data = await apiClient.get<any>(`/bookings/?guest=${guestId}`, token)
  return Array.isArray(data) ? data : (data.results || [])
}
