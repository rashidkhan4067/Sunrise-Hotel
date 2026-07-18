import type { Guest } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MoreHorizontal,
  BadgeInfo,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface DataTableProps {
  guests: Guest[]
  onViewDetails: (guest: Guest) => void
  onEdit: (guest: Guest) => void
  onToggleStatus: (guest: Guest) => void
  onDelete: (guest: Guest) => void
  onOpenAddDialog: () => void
  role?: string
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function DataTable({
  guests,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenAddDialog,
  role,
}: DataTableProps) {
  const isAdmin = role === "org:admin" || role === "Admin" || role === "ADMIN"

  return (
    <div className="border border-border bg-card rounded-xl shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Document (CNIC/Passport)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="w-[60px] text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.length > 0 ? (
            guests.map((guest) => (
              <TableRow
                key={guest.id}
                className="hover:bg-muted/10 transition-all duration-100"
              >
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{guest.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{guest.phone_number}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {guest.email ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{guest.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/45 italic">No email</span>
                  )}
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {guest.document_number}
                </TableCell>
                <TableCell>
                  {guest.is_active ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none hover:bg-emerald-500/15">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-none hover:bg-slate-500/15">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(guest.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewDetails(guest)}
                        className="cursor-pointer gap-2"
                      >
                        <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onEdit(guest)}
                        className="cursor-pointer gap-2"
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        Edit Guest
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onToggleStatus(guest)}
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
                            onClick={() => onDelete(guest)}
                            className="cursor-pointer gap-2 text-destructive hover:!bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Profile
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-56 text-center">
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
                    onClick={onOpenAddDialog}
                    className="cursor-pointer"
                  >
                    Add First Guest
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
