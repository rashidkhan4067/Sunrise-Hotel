import { apiClient } from "@/lib/api-client"
import { IS_DEMO_MODE, DEMO_STAFF_USERS, demoDelay } from "@/lib/demo-data"

export async function fetchUsers(token: string) {
  if (IS_DEMO_MODE) return demoDelay(DEMO_STAFF_USERS)
  return apiClient.get<any[]>("/auth/users/", token)
}

export async function createUser(data: any, token: string) {
  if (IS_DEMO_MODE) {
    return demoDelay({
      id: Date.now(),
      ...data,
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString().split("T")[0],
      avatar: "",
    })
  }
  return apiClient.post<any>("/auth/users/", data, token)
}

export async function updateUser(id: string | number, data: any, token: string) {
  if (IS_DEMO_MODE) {
    const found = DEMO_STAFF_USERS.find((u) => String(u.id) === String(id))
    return demoDelay({ ...(found ?? {}), ...data })
  }
  return apiClient.patch<any>(`/auth/users/${id}/`, data, token)
}

export async function deleteUser(id: string | number, token: string) {
  if (IS_DEMO_MODE) return demoDelay(true)
  return apiClient.delete<boolean>(`/auth/users/${id}/`, token)
}

export async function resetUserPassword(id: string | number, password: string, token: string) {
  if (IS_DEMO_MODE) return demoDelay(true)
  return apiClient.post<boolean>(`/auth/users/${id}/reset-password/`, { password }, token)
}
