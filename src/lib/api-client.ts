import { API_BASE_URL } from "@/constants"

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string
  body?: any
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers: customHeaders, ...rest } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`

  const response = await fetch(url, {
    ...rest,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    const errorMessage =
      errData.error ||
      errData.detail ||
      errData.message ||
      errData.phone_number ||
      errData.document_number ||
      errData.room_number ||
      errData.price_per_night ||
      `Request failed with status ${response.status}`

    throw new Error(typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage))
  }

  if (response.status === 204) {
    return true as T
  }

  return response.json()
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body?: any, token?: string) =>
    request<T>(endpoint, { method: "POST", body, token }),

  patch: <T>(endpoint: string, body?: any, token?: string) =>
    request<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),
}
