"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Download, MoreHorizontal, BadgeInfo, Edit, Trash2, Phone, Mail, User, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ErrorBanner, DataTable, FilterBar, type ColumnDef } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useSearchParams } from "react-router-dom"
import type { Guest } from "../types"

import { GuestDetailView } from "../components/guest-detail-view"
import { GuestFormDialog, DeleteGuestDialog } from "../components/guest-dialogs"
import type { GuestFormValues } from "../schemas"
import {
  fetchGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from "../api"
import { isAdminRole } from "@/lib/utils"
import { formatDate, downloadCSV } from "@/utils/format"

export function GuestManagementPage() {
  const { getToken, role: authRole } = useAuth()
  const role = authRole || "org:member"
  const [searchParams] = useSearchParams()

  // ─── State ───────────────────────────────────────────
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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

  // ─── Export CSV ────────────────────────────────────
  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.error("No filtered records to export")
      return
    }
    downloadCSV(
      ["ID", "Full Name", "Phone", "Email", "Document ID", "Status", "Registered At"],
      filtered.map((g) => [
        g.id,
        g.full_name,
        g.phone_number,
        g.email || "",
        g.document_number,
        g.is_active ? "Active" : "Inactive",
        g.created_at ? new Date(g.created_at).toLocaleDateString() : "",
      ]),
      "guests_export"
    )
    toast.success("Guest list exported successfully")
  }

  const isAdmin = isAdminRole(role)


  const guestColumns: ColumnDef<Guest>[] = [
    {
      header: "Full Name",
      cell: (guest) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{guest.full_name}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 md:hidden">
            <span className="text-xs text-muted-foreground">{guest.phone_number}</span>
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              guest.is_active
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-500/15 text-slate-500"
            )}>
              {guest.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Phone Number",
      hideOnMobile: true,
      cell: (guest) => (
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Phone className="h-3.5 w-3.5" />
          <span>{guest.phone_number}</span>
        </div>
      ),
    },
    {
      header: "Email Address",
      hideOnMobile: true,
      cell: (guest) => (
        guest.email ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Mail className="h-3.5 w-3.5" />
            <span>{guest.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground/45 italic text-sm">No email</span>
        )
      ),
    },
    {
      header: "Document (CNIC/Passport)",
      hideOnMobile: true,
      cell: (guest) => <span className="text-sm font-mono text-muted-foreground">{guest.document_number}</span>,
    },
    {
      header: "Status",
      hideOnMobile: true,
      cell: (guest) => (
        guest.is_active ? (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none hover:bg-emerald-500/15">
            Active
          </Badge>
        ) : (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-none hover:bg-slate-500/15">
            Inactive
          </Badge>
        )
      ),
    },
    {
      header: "Registered",
      hideOnMobile: true,
      cell: (guest) => <span className="text-xs text-muted-foreground">{formatDate(guest.created_at)}</span>,
    },
    {
      header: "",
      className: "w-[60px] text-right",
      cell: (guest) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelected(guest)
                setDetailOpen(true)
              }}
              className="cursor-pointer gap-2"
            >
              <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setSelected(guest)
                setEditOpen(true)
              }}
              className="cursor-pointer gap-2"
            >
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              Edit Guest
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleToggleStatus(guest)}
              className="cursor-pointer gap-2 text-foreground"
            >
              {guest.is_active ? (
                <>
                  <XCircle className="h-3.5 w-3.5 text-slate-500" />
                  Deactivate Guest
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Activate Guest
                </>
              )}
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(guest)
                    setDeleteOpen(true)
                  }}
                  className="cursor-pointer gap-2 text-destructive hover:!bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Profile
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const guestEmptyState = (
    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
      <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
        <BadgeInfo className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-sm">No guests found</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Add a guest profile or search for another name.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAddOpen(true)}
        className="cursor-pointer"
      >
        Add First Guest
      </Button>
    </div>
  )

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

        <FilterBar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search by Name, Phone, CNIC/Passport...",
            label: "Search Guests",
          }}
          filters={[
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onValueChange: setStatusFilter,
              options: [
                { label: "All Profiles", value: "all" },
                { label: "Active Only", value: "active" },
                { label: "Inactive Only", value: "inactive" },
              ],
            },
          ]}
          onReset={resetFilters}
          isFiltered={search !== "" || statusFilter !== "all"}
        />

        {/* Data Table */}
        <DataTable
          data={filtered}
          columns={guestColumns}
          loading={loading}
          emptyState={guestEmptyState}
        />

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
