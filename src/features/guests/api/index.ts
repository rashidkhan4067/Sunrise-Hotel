import { apiClient } from "@/lib/api-client"
import { IS_DEMO_MODE, DEMO_GUESTS, DEMO_BOOKINGS, demoDelay } from "@/lib/demo-data"

export async function fetchGuests(token: string) {
  if (IS_DEMO_MODE) return demoDelay(DEMO_GUESTS)
  const data = await apiClient.get<any>("/guests/", token)
  return Array.isArray(data) ? data : (data.results || [])
}

export async function fetchGuest(id: string | number, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_GUESTS.find((g) => String(g.id) === String(id))
    return demoDelay(found ?? null)
  }
  return apiClient.get<any>(`/guests/${id}/`, token)
}

export async function createGuest(data: any, token: string) {
  if (IS_DEMO_MODE) {
    return demoDelay({
      id: Date.now(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
  return apiClient.post<any>("/guests/", data, token)
}

export async function updateGuest(id: string | number, data: any, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_GUESTS.find((g) => String(g.id) === String(id))
    return demoDelay({ ...(found ?? {}), ...data, updated_at: new Date().toISOString() })
  }
  return apiClient.patch<any>(`/guests/${id}/`, data, token)
}

export async function deleteGuest(id: string | number, token: string) {
  if (IS_DEMO_MODE) return demoDelay(true)
  return apiClient.delete<boolean>(`/guests/${id}/`, token)
}

export async function fetchGuestBookings(guestId: string | number, token: string) {
  if (IS_DEMO_MODE) {
    const guestBookings = DEMO_BOOKINGS.filter((b) => String(b.guest) === String(guestId))
    return demoDelay(guestBookings)
  }
  const data = await apiClient.get<any>(`/bookings/?guest=${guestId}`, token)
  return Array.isArray(data) ? data : (data.results || [])
}
