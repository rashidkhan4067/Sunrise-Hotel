"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Download } from "lucide-react"
import { ErrorBanner } from "@/components/shared"
import { toast } from "sonner"

import { useSearchParams } from "react-router-dom"
import type { Guest } from "../types"
import { FilterBar } from "../components/filter-bar"
import { DataTable } from "../components/data-table"
import { GuestDetailView } from "../components/guest-detail-view"
import { GuestFormDialog, DeleteGuestDialog } from "../components/guest-dialogs"
import type { GuestFormValues } from "../schemas"
import {
  fetchGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from "../api"

export function GuestManagementPage() {
  const { getToken, role: authRole } = useAuth()
  const role = authRole || "org:member"
  const [searchParams] = useSearchParams()

  // ─── State ───────────────────────────────────
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [authToken, setAuthToken] = useState<string>("")

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Selection
  const [selected, setSelected] = useState<Guest | null>(null)

  // Dialogs
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setAddOpen(true)
    }
  }, [searchParams])

  // ─── Load Data ──────────────────────────────
  async function loadGuests() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (token) {
        setAuthToken(token)
        const data = await fetchGuests(token)
        setGuests(data)
      } else {
        throw new Error("No authentication token available")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load guest list")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Search & Status Filters ──────────────────
  const filtered = useMemo(() => {
    return guests.filter((g) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        g.full_name.toLowerCase().includes(q) ||
        g.phone_number.toLowerCase().includes(q) ||
        g.document_number.toLowerCase().includes(q) ||
        (g.email && g.email.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && g.is_active) ||
        (statusFilter === "inactive" && !g.is_active)

      return matchesSearch && matchesStatus
    })
  }, [guests, search, statusFilter])

  function resetFilters() {
    setSearch("")
    setStatusFilter("all")
  }

  // ─── Handlers ────────────────────────────────
  async function handleAdd(values: GuestFormValues) {
    const token = await getToken()
    await createGuest({ ...values, is_active: true }, token!)
    toast.success("Guest profile created successfully")
    await loadGuests()
  }

  async function handleEdit(values: GuestFormValues) {
    if (!selected) return
    const token = await getToken()
    await updateGuest(selected.id, values, token!)
    toast.success("Guest profile updated successfully")
    await loadGuests()
  }

  async function handleToggleStatus(guest: Guest) {
    const nextStatus = !guest.is_active
    const actionWord = nextStatus ? "activate" : "deactivate"
    try {
      const token = await getToken()
      await updateGuest(guest.id, { is_active: nextStatus }, token!)
      toast.success(`Guest profile successfully ${nextStatus ? "activated" : "deactivated"}`)
      await loadGuests()
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${actionWord} guest profile`)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setActionLoading(true)
    try {
      const token = await getToken()
      await deleteGuest(selected.id, token!)
      toast.success("Guest profile deleted")
      setDeleteOpen(false)
      await loadGuests()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete guest profile")
    } finally {
      setActionLoading(false)
    }
  }

  // ─── Export CSV ─────────────────────────────
  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.error("No filtered records to export")
      return
    }
    const headers = ["ID", "Full Name", "Phone", "Email", "Document ID", "Status", "Registered At"]
    const rows = filtered.map((g) => [
      g.id,
      g.full_name,
      g.phone_number,
      g.email || "",
      g.document_number,
      g.is_active ? "Active" : "Inactive",
      g.created_at ? new Date(g.created_at).toLocaleDateString() : "",
    ])
    
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `guests_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Guest list exported successfully")
  }

  return (
    <BaseLayout
      title="Guests"
      description="Manage hotel guest profiles and register new arrivals."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="cursor-pointer gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadGuests}
            disabled={loading}
            className="cursor-pointer gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Guest
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        {/* Error state */}
        {error && !loading && (
          <ErrorBanner message={error} onRetry={loadGuests} />
        )}

        {/* Filter bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onReset={resetFilters}
        />

        {/* Data Table */}
        {loading ? (
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="h-10 bg-muted/30 animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 border-t border-border bg-background animate-pulse opacity-50" />
            ))}
          </div>
        ) : (
          <DataTable
            guests={filtered}
            role={role}
            onOpenAddDialog={() => setAddOpen(true)}
            onViewDetails={(g) => {
              setSelected(g)
              setDetailOpen(true)
            }}
            onEdit={(g) => {
              setSelected(g)
              setEditOpen(true)
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={(g) => {
              setSelected(g)
              setDeleteOpen(true)
            }}
          />
        )}

        {/* Dialogs */}
        <GuestFormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mode="add"
          onSubmit={handleAdd}
        />

        <GuestFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          guest={selected}
          onSubmit={handleEdit}
        />

        <GuestDetailView
          open={detailOpen}
          onOpenChange={setDetailOpen}
          guest={selected}
          token={authToken}
        />

        <DeleteGuestDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          guest={selected}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      </div>
    </BaseLayout>
  )
}
