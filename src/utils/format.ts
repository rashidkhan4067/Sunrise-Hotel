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

import { useAppStore } from "@/store/use-app-store"

/**
 * Format currency amount (e.g., "$120.00" or "PKR 120.00")
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const currency = useAppStore.getState().hotelInfo?.currency || "USD"
  if (amount === null || amount === undefined || amount === "") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(0)
  }
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(0)
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${currency} ${num.toFixed(2)}`
  }
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

/**
 * Trigger a CSV file download in the browser.
 * @param headers - Array of column header strings
 * @param rows - 2D array of row values
 * @param filename - Output filename (without extension)
 */
export function downloadCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][], filename: string): void {
  const escape = (val: string | number | boolean | null | undefined) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`

  const csvContent =
    [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
