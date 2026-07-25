import { apiClient } from "@/lib/api-client"

export interface FetchRoomsParams {
  search?: string
  status?: string
  room_type?: string
  floor?: string
  is_clean?: string
  is_inspected?: string
  ordering?: string
  page?: number
  page_size?: number
}

export async function fetchRooms(token: string, params?: FetchRoomsParams) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        searchParams.append(key, String(val))
      }
    })
  }
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return apiClient.get<any>(`/rooms/${query}`, token)
}

export async function fetchRoom(id: string | number, token: string) {
  return apiClient.get<any>(`/rooms/${id}/`, token)
}

export async function createRoom(data: any, token: string) {
  return apiClient.post<any>("/rooms/", data, token)
}

export async function updateRoom(id: string | number, data: any, token: string) {
  return apiClient.patch<any>(`/rooms/${id}/`, data, token)
}

export async function deleteRoom(id: string | number, token: string) {
  return apiClient.delete<boolean>(`/rooms/${id}/`, token)
}

export async function fetchRoomsSummary(token: string) {
  return apiClient.get<any>("/rooms/summary/", token)
}

export async function toggleRoomClean(id: string | number, token: string) {
  return apiClient.post<any>(`/rooms/${id}/toggle-clean/`, {}, token)
}

export async function toggleRoomInspect(id: string | number, token: string) {
  return apiClient.post<any>(`/rooms/${id}/toggle-inspect/`, {}, token)
}
