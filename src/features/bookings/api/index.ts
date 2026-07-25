import { apiClient } from "@/lib/api-client"
import { fetchGuests as fetchGuestsApi } from "@/features/guests/api"

export async function fetchBookings(token: string) {
  return apiClient.get<any[]>("/bookings/", token)
}

export async function fetchBooking(id: string, token: string) {
  return apiClient.get<any>(`/bookings/${id}/`, token)
}

export async function createBooking(data: any, token: string) {
  return apiClient.post<any>("/bookings/", data, token)
}

export async function updateBooking(id: string, data: any, token: string) {
  return apiClient.patch<any>(`/bookings/${id}/`, data, token)
}

export async function deleteBooking(id: string, token: string) {
  return apiClient.delete<boolean>(`/bookings/${id}/`, token)
}

export async function checkInBooking(id: string, token: string) {
  return apiClient.post<any>(`/bookings/${id}/check-in/`, {}, token)
}

export async function checkOutBooking(id: string, token: string) {
  return apiClient.post<any>(`/bookings/${id}/check-out/`, {}, token)
}

export async function cancelBooking(id: string, token: string) {
  return apiClient.post<any>(`/bookings/${id}/cancel/`, {}, token)
}

export async function fetchAvailableRooms(checkIn: string, checkOut: string, token: string) {
  return apiClient.get<any[]>(`/rooms/available/?check_in=${checkIn}&check_out=${checkOut}`, token)
}

export const fetchGuests = fetchGuestsApi

export async function fetchFolioByBooking(bookingId: string, token: string) {
  const folios = await apiClient.get<any[]>(`/folios/?booking=${bookingId}`, token)
  return folios && folios.length > 0 ? folios[0] : null
}

export async function postFolioItem(data: { folio: number; item_type: string; description: string; amount: number }, token: string) {
  return apiClient.post<any>("/folio-items/", data, token)
}
