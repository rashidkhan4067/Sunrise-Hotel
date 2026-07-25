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
    
    let errorMessage = `Request failed with status ${response.status}`
    if (errData) {
      if (errData.error && typeof errData.error === "string") {
        errorMessage = errData.error
      } else if (errData.detail && typeof errData.detail === "string") {
        errorMessage = errData.detail
      } else if (errData.message && typeof errData.message === "string") {
        errorMessage = errData.message
      } else if (errData.errors && Array.isArray(errData.errors) && errData.errors[0]) {
        errorMessage = errData.errors[0].longMessage || errData.errors[0].message || errorMessage
      } else {
        // Extract from Django DRF serializer dictionary: { "field": ["error"] }
        for (const key in errData) {
          if (Object.prototype.hasOwnProperty.call(errData, key)) {
            const val = errData[key]
            if (Array.isArray(val) && typeof val[0] === "string") {
              errorMessage = `${key}: ${val[0]}`
              break
            } else if (typeof val === "string") {
              errorMessage = `${key}: ${val}`
              break
            }
          }
        }
      }
    }

    throw new Error(errorMessage)
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

  put: <T>(endpoint: string, body?: any, token?: string) =>
    request<T>(endpoint, { method: "PUT", body, token }),

  patch: <T>(endpoint: string, body?: any, token?: string) =>
    request<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),
}
