import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the correct URL for public assets
 * Handles both development and production asset paths
 */
export function assetUrl(path: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return baseUrl + cleanPath
}

/**
 * Get the correct URL path with basename prefix for internal navigation
 * @param path - The internal path (e.g., "/dashboard", "/auth/sign-in")
 * @returns The full path with basename prefix
 */
export function getAppUrl(path: string): string {
  const basename = import.meta.env.VITE_BASENAME || ''
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return basename + cleanPath
}

/**
 * Extract initials from a full name (e.g. "John Doe" -> "JD", "Single" -> "SI")
 */
export function getInitials(name: string): string {
  if (!name) return "U"
  
  // Clean up parenthetical tags like (Client) or (Admin) and any non-alphabetical characters
  const cleanName = name.replace(/\([^)]*\)/g, "").replace(/[^a-zA-Z\s]/g, "").trim()
  if (!cleanName) return "U"
  
  const names = cleanName.split(/\s+/)
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase().slice(0, 2)
  }
  return cleanName.slice(0, 2).toUpperCase()
}

/**
 * Check if a role string represents an admin role.
 * Handles all role string variants used across the app.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false
  return role === "org:admin" || role === "Admin" || role === "ADMIN"
}
