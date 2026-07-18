/**
 * Centralized Formatting Utility Functions
 */

/**
 * Format a date string into readable text (e.g., "Jul 18, 2026")
 */
export function formatDate(
  dateStr: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
): string {
  if (!dateStr) return "—"
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr
    if (isNaN(d.getTime())) return String(dateStr)
    return d.toLocaleDateString("en-US", options)
  } catch {
    return String(dateStr)
  }
}

/**
 * Format currency amount (e.g., "$120.00")
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "$0.00"
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Shorten long UUID or ID strings (e.g., "A1B2C3D4")
 */
export function formatShortId(id: string | null | undefined, length = 8): string {
  if (!id) return "—"
  return String(id).slice(0, length).toUpperCase()
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return "—"
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
