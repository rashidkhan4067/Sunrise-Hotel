import { apiClient } from "@/lib/api-client"
import { fetchGuests as fetchGuestsApi } from "@/features/guests/api"
import {
  IS_DEMO_MODE,
  DEMO_BOOKINGS,
  DEMO_ROOMS,
  getDemoFolio,
  demoDelay,
} from "@/lib/demo-data"

export async function fetchBookings(token: string) {
  if (IS_DEMO_MODE) return demoDelay(DEMO_BOOKINGS)
  return apiClient.get<any[]>("/bookings/", token)
}

export async function fetchBooking(id: string, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_BOOKINGS.find((b) => b.booking_id === id)
    return demoDelay(found ?? null)
  }
  return apiClient.get<any>(`/bookings/${id}/`, token)
}

export async function createBooking(data: any, token: string) {
  if (IS_DEMO_MODE) {
    const newBooking = {
      ...data,
      booking_id: `BK-DEMO-${Date.now()}`,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return demoDelay(newBooking)
  }
  return apiClient.post<any>("/bookings/", data, token)
}

export async function updateBooking(id: string, data: any, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_BOOKINGS.find((b) => b.booking_id === id)
    return demoDelay({ ...(found ?? {}), ...data, updated_at: new Date().toISOString() })
  }
  return apiClient.patch<any>(`/bookings/${id}/`, data, token)
}

export async function deleteBooking(id: string, token: string) {
  if (IS_DEMO_MODE) return demoDelay(true)
  return apiClient.delete<boolean>(`/bookings/${id}/`, token)
}

export async function checkInBooking(id: string, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_BOOKINGS.find((b) => b.booking_id === id)
    return demoDelay({ ...(found ?? {}), status: "CHECKED_IN" })
  }
  return apiClient.post<any>(`/bookings/${id}/check-in/`, {}, token)
}

export async function checkOutBooking(id: string, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_BOOKINGS.find((b) => b.booking_id === id)
    return demoDelay({ ...(found ?? {}), status: "CHECKED_OUT" })
  }
  return apiClient.post<any>(`/bookings/${id}/check-out/`, {}, token)
}

export async function cancelBooking(id: string, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_BOOKINGS.find((b) => b.booking_id === id)
    return demoDelay({ ...(found ?? {}), status: "CANCELLED" })
  }
  return apiClient.post<any>(`/bookings/${id}/cancel/`, {}, token)
}

export async function fetchAvailableRooms(checkIn: string, checkOut: string, token: string) {
  if (IS_DEMO_MODE) {
    const available = DEMO_ROOMS.filter((r) => r.status === "AVAILABLE")
    return demoDelay(available)
  }
  return apiClient.get<any[]>(`/rooms/available/?check_in=${checkIn}&check_out=${checkOut}`, token)
}

export const fetchGuests = IS_DEMO_MODE
  ? async (_token: string) => {
      const { DEMO_GUESTS } = await import("@/lib/demo-data")
      return demoDelay(DEMO_GUESTS)
    }
  : fetchGuestsApi

export async function fetchFolioByBooking(bookingId: string, token: string) {
  if (IS_DEMO_MODE) return demoDelay(getDemoFolio(bookingId))
  const folios = await apiClient.get<any[]>(`/folios/?booking=${bookingId}`, token)
  return folios && folios.length > 0 ? folios[0] : null
}

export async function postFolioItem(data: { folio: number; item_type: string; description: string; amount: number }, token: string) {
  if (IS_DEMO_MODE) return demoDelay({ id: Date.now(), ...data })
  return apiClient.post<any>("/folio-items/", data, token)
}
