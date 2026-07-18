import { apiClient } from "@/lib/api-client"

export async function fetchUsers(token: string) {
  return apiClient.get<any[]>("/auth/users/", token)
}

export async function createUser(data: any, token: string) {
  return apiClient.post<any>("/auth/users/", data, token)
}

export async function updateUser(id: string | number, data: any, token: string) {
  return apiClient.patch<any>(`/auth/users/${id}/`, data, token)
}

export async function deleteUser(id: string | number, token: string) {
  return apiClient.delete<boolean>(`/auth/users/${id}/`, token)
}

export async function resetUserPassword(id: string | number, password: string, token: string) {
  return apiClient.post<boolean>(`/auth/users/${id}/reset-password/`, { password }, token)
}
