import { apiClient } from "@/lib/api-client"
import { IS_DEMO_MODE, DEMO_ROOMS, DEMO_ROOMS_SUMMARY, demoDelay } from "@/lib/demo-data"

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
  if (IS_DEMO_MODE) {
    let results = [...DEMO_ROOMS]

    // Apply filters
    if (params?.search) {
      const q = params.search.toLowerCase()
      results = results.filter(
        (r) =>
          r.room_number.toLowerCase().includes(q) ||
          r.room_type.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      )
    }
    if (params?.status && params.status !== "all") {
      results = results.filter((r) => r.status.toLowerCase() === params.status!.toLowerCase())
    }
    if (params?.room_type && params.room_type !== "all") {
      results = results.filter((r) => r.room_type === params.room_type)
    }
    if (params?.floor && params.floor !== "all") {
      results = results.filter((r) => String(r.floor) === params.floor)
    }
    if (params?.is_clean && params.is_clean !== "all") {
      results = results.filter((r) => String(r.is_clean) === params.is_clean)
    }
    if (params?.is_inspected && params.is_inspected !== "all") {
      results = results.filter((r) => String(r.is_inspected) === params.is_inspected)
    }

    // Pagination
    const page = params?.page ?? 1
    const pageSize = params?.page_size ?? 10
    const start = (page - 1) * pageSize
    const paginated = results.slice(start, start + pageSize)

    return demoDelay({
      count: results.length,
      next: start + pageSize < results.length ? "next" : null,
      previous: page > 1 ? "prev" : null,
      results: paginated,
    })
  }

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
  if (IS_DEMO_MODE) {
    const found = DEMO_ROOMS.find((r) => String(r.id) === String(id))
    return demoDelay(found ?? null)
  }
  return apiClient.get<any>(`/rooms/${id}/`, token)
}

export async function createRoom(data: any, token: string) {
  if (IS_DEMO_MODE) {
    return demoDelay({ id: Date.now(), ...data, is_clean: true, is_inspected: true, is_archived: false })
  }
  return apiClient.post<any>("/rooms/", data, token)
}

export async function updateRoom(id: string | number, data: any, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_ROOMS.find((r) => String(r.id) === String(id))
    return demoDelay({ ...(found ?? {}), ...data })
  }
  return apiClient.patch<any>(`/rooms/${id}/`, data, token)
}

export async function deleteRoom(id: string | number, token: string) {
  if (IS_DEMO_MODE) return demoDelay(true)
  return apiClient.delete<boolean>(`/rooms/${id}/`, token)
}

export async function fetchRoomsSummary(token: string) {
  if (IS_DEMO_MODE) return demoDelay(DEMO_ROOMS_SUMMARY)
  return apiClient.get<any>("/rooms/summary/", token)
}

export async function toggleRoomClean(id: string | number, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_ROOMS.find((r) => String(r.id) === String(id))
    return demoDelay({ ...(found ?? {}), is_clean: !found?.is_clean })
  }
  return apiClient.post<any>(`/rooms/${id}/toggle-clean/`, {}, token)
}

export async function toggleRoomInspect(id: string | number, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_ROOMS.find((r) => String(r.id) === String(id))
    return demoDelay({ ...(found ?? {}), is_inspected: !found?.is_inspected })
  }
  return apiClient.post<any>(`/rooms/${id}/toggle-inspect/`, {}, token)
}
