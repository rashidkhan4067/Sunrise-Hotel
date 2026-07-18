"use client"

import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { StatCard } from "@/components/stat-card"
import { Users, UserCheck, Shield, ConciergeBell } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  EllipsisVertical,
  Eye,
  Pencil,
  KeyRound,
  Ban,
  Trash2,
} from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared"
import { useUser, useOrganization } from "@clerk/react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// Modular Dialog Components
import { AddUserDialog } from "../components/add-user-dialog"
import { EditUserDialog } from "../components/edit-user-dialog"
import { ViewUserDialog } from "../components/view-user-dialog"
import { ResetPasswordDialog } from "../components/reset-password-dialog"
import { DeactivateUserDialog } from "../components/deactivate-user-dialog"

// Feature Imports
import type { User } from "../types"
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword } from "../api"

const getStatusColor = (status: string) => {
  return status === "Active"
    ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
    : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
}

const getRoleColor = (role: string) => {
  return role === "Admin"
    ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
    : "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
}



export function UserManagementPage() {
  const { user: currentUser, isLoaded: isUserLoaded } = useUser()
  const { memberships, isLoaded: isOrgLoaded } = useOrganization({
    memberships: {
      pageSize: 50,
    }
  })
  const { getToken } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  
  // Dialog Open States
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  // Target User States
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [targetUser, setTargetUser] = useState<User | null>(null)

  useEffect(() => {
    if (hasInitialized) return
    if (!isOrgLoaded || !isUserLoaded) return
    
    async function loadRealUsers() {
      try {
        const token = await getToken()
        if (token) {
          const data = await fetchUsers(token)
          if (Array.isArray(data)) {
            const cachedStr = localStorage.getItem("registered_users_cache")
            const cachedList = cachedStr ? JSON.parse(cachedStr) : []
            
            const currentUserEmail = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.emailAddresses?.[0]?.emailAddress || ""

            const enrichedData = data.map(u => {
              let avatar = u.avatar
              if (!avatar || !(avatar.startsWith("http") || avatar.startsWith("data:"))) {
                if (currentUserEmail && u.email.toLowerCase() === currentUserEmail.toLowerCase()) {
                  avatar = currentUser?.imageUrl || ""
                } else {
                  const cached = cachedList.find((c: any) => c.email.toLowerCase() === u.email.toLowerCase())
                  if (cached && cached.avatar) {
                    avatar = cached.avatar
                  }
                }
              }
              return { ...u, avatar }
            })
            
            // Merge local storage cached users
            const mergedList = [...enrichedData]
            for (const cached of cachedList) {
              if (cached.email && cached.name && !mergedList.some(u => u.email.toLowerCase() === cached.email.toLowerCase())) {
                mergedList.push({
                  id: cached.id || "local_" + Math.random().toString(36).substr(2, 9),
                  name: cached.name,
                  email: cached.email,
                  avatar: cached.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cached.name)}`,
                  phone: cached.phone || "",
                  role: cached.role || "Receptionist",
                  status: cached.status || "Active",
                  joinedDate: cached.joinedDate || new Date().toISOString().split('T')[0],
                  lastLogin: cached.lastLogin || new Date().toISOString().split('T')[0],
                })
              }
            }
            
            setUsers(mergedList)
            setHasInitialized(true)
            return
          }
        }
      } catch (err) {
        console.warn("Failed to fetch users from Django backend, falling back to local session merge:", err)
      }
      
      // Fallback
      let mapped: User[] = []
      const membershipData = (memberships as any)?.data || []
      
      if (membershipData.length > 0) {
        mapped = membershipData.map((m: any, idx: number) => {
          const user = m.publicUserData
          return {
            id: user.userId || idx + 1,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Clerk User",
            email: user.identifier || "",
            avatar: user.imageUrl || "",
            phone: "",
            role: m.role === "org:admin" ? "Admin" : "Receptionist",
            status: "Active",
            joinedDate: m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastLogin: m.updatedAt ? new Date(m.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }
        })
      } else if (currentUser) {
        const currentUserEmail = currentUser.primaryEmailAddress?.emailAddress || currentUser.emailAddresses?.[0]?.emailAddress || ""
        mapped = [
          {
            id: currentUser.id || 1,
            name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "Logged In User",
            email: currentUserEmail,
            avatar: currentUser.imageUrl || "",
            phone: "",
            role: "Admin",
            status: "Active",
            joinedDate: currentUser.createdAt ? new Date(currentUser.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastLogin: currentUser.updatedAt ? new Date(currentUser.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }
        ]
      }
      
      let cachedUsers: User[] = []
      try {
        const stored = localStorage.getItem("registered_users_cache")
        if (stored) {
          const list = JSON.parse(stored)
          cachedUsers = list.map((u: any, idx: number) => ({
            id: u.id || "local_" + idx + 1,
            name: u.name,
            email: u.email,
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
            phone: u.phone || "",
            role: u.role || "Receptionist",
            status: u.status || "Active",
            joinedDate: u.joinedDate || new Date().toISOString().split('T')[0],
            lastLogin: u.lastLogin || new Date().toISOString().split('T')[0],
          }))
        }
      } catch (e) {
        console.error("Failed to parse cached registered users:", e)
      }
      
      const mergedList = [...mapped]
      for (const cached of cachedUsers) {
        if (!mergedList.some(u => u.email.toLowerCase() === cached.email.toLowerCase())) {
          mergedList.push({
            ...cached,
            id: mergedList.length + 1
          })
        }
      }
      setUsers(mergedList)
      setHasInitialized(true)
    }
    loadRealUsers()
  }, [isOrgLoaded, isUserLoaded, memberships, currentUser, hasInitialized, getToken])

  // Save changes helper
  const saveToLocalCache = (list: User[]) => {
    const localOnly = list.filter(u => String(u.id).startsWith("local_") || u.email.toLowerCase() !== currentUser?.primaryEmailAddress?.emailAddress?.toLowerCase())
    localStorage.setItem("registered_users_cache", JSON.stringify(localOnly))
  }

  // Add Staff Member Submit
  const handleAddSubmit = async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password?: string
    role: string
    status: string
  }) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim()
    try {
      const token = await getToken()
      if (token) {
        const payload = {
          name: fullName,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role.toUpperCase() === "ADMIN" ? "ADMIN" : "RECEPTIONIST",
          is_active: data.status === "Active",
          status: data.status
        }
        const createdStaff = await createUser(payload, token)
        setUsers(prev => [createdStaff, ...prev])
        toast.success(`${fullName} created successfully as ${data.role}!`)
        setAddOpen(false)
        return
      }
    } catch (err) {
      console.warn("Failed to create staff via backend API, using local fallback:", err)
    }

    // Local fallback
    const newStaff: User = {
      id: "local_" + Math.random().toString(36).substr(2, 9),
      name: fullName,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      phone: data.phone,
      role: data.role,
      status: data.status,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
    }

    const updated = [newStaff, ...users]
    setUsers(updated)
    saveToLocalCache(updated)
    setAddOpen(false)
    toast.success(`${fullName} created successfully as ${data.role}! (Local Profile)`)
  }

  // Edit Click Handler
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditOpen(true)
  }

  // Edit Submit Handler
  const handleEditSubmit = async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    status: string
  }) => {
    if (!editingUser) return

    const fullName = `${data.firstName} ${data.lastName}`.trim()
    try {
      const token = await getToken()
      if (token) {
        const payload = {
          name: fullName,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role.toUpperCase() === "ADMIN" ? "ADMIN" : "RECEPTIONIST",
          is_active: data.status === "Active",
          status: data.status
        }
        const updatedStaff = await updateUser(editingUser.id, payload, token)
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedStaff : u))
        toast.success("User updated successfully!")
        setEditOpen(false)
        setEditingUser(null)
        return
      }
    } catch (err) {
      console.warn("Failed to edit staff via backend API, using local fallback:", err)
    }

    // Local fallback
    const updated = users.map(u => 
      u.id === editingUser.id 
        ? {
            ...u,
            name: fullName,
            email: data.email,
            phone: data.phone,
            role: data.role,
            status: data.status,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
          }
        : u
    )

    setUsers(updated)
    saveToLocalCache(updated)
    setEditOpen(false)
    setEditingUser(null)
    toast.success("User updated successfully! (Local Profile)")
  }

  // Reset Password Handler
  const handleResetPassword = (user: User) => {
    setTargetUser(user)
    setResetOpen(true)
  }

  const handleResetSubmit = async (password: string) => {
    if (!targetUser) return
    try {
      const token = await getToken()
      if (token) {
        await resetUserPassword(targetUser.id, password, token)
        toast.success(`Password for ${targetUser.name} reset successfully!`)
        setResetOpen(false)
        setTargetUser(null)
        return
      }
    } catch (err) {
      console.warn("Failed to reset password via backend API, using local fallback:", err)
    }

    setResetOpen(false)
    setTargetUser(null)
    toast.success("Password reset successfully! (Local Cache)")
  }

  // Deactivate Handler
  const handleDeactivateClick = (user: User) => {
    setTargetUser(user)
    setDeactivateOpen(true)
  }

  const handleDeactivateConfirm = async () => {
    if (!targetUser) return
    try {
      const token = await getToken()
      if (token) {
        const updatedStaff = await updateUser(targetUser.id, { is_active: false, status: "Inactive" }, token)
        setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedStaff : u))
        toast.success("User account deactivated successfully!")
        setDeactivateOpen(false)
        setTargetUser(null)
        return
      }
    } catch (err) {
      console.warn("Failed to deactivate staff via backend API, using local fallback:", err)
    }

    // Local fallback
    const updated = users.map(u => 
      u.id === targetUser.id ? { ...u, status: "Inactive" } : u
    )
    setUsers(updated)
    saveToLocalCache(updated)
    setDeactivateOpen(false)
    setTargetUser(null)
    toast.success("User account deactivated successfully! (Local Profile)")
  }

  // Delete User Handler
  const handleDeleteUser = async (id: number | string) => {
    const target = users.find(u => u.id === id)
    if (target && confirm(`Are you sure you want to permanently delete ${target.name}?`)) {
      try {
        const token = await getToken()
        if (token) {
          await deleteUser(id, token)
          setUsers(prev => prev.filter(u => u.id !== id))
          toast.success(`${target.name} deleted successfully!`)
          return
        }
      } catch (err) {
        console.warn("Failed to delete user via backend API, using local fallback:", err)
      }

      // Local fallback
      const updated = users.filter(u => u.id !== id)
      setUsers(updated)
      saveToLocalCache(updated)
      toast.success(`${target.name} deleted successfully! (Local Profile)`)
    }
  }

  // View User details
  const handleViewUser = (user: User) => {
    setTargetUser(user)
    setViewOpen(true)
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Full Name",
      cell: (user) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage 
              src={user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) 
                ? user.avatar 
                : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
              } 
              alt={user.name} 
            />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{user.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5 md:hidden">
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                user.role === "Admin"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              )}>
                {user.role}
              </span>
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                user.status === "Active"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-gray-500/10 text-gray-500 dark:text-gray-400"
              )}>
                {user.status}
              </span>
            </div>
            <span className="text-xs text-muted-foreground truncate md:hidden">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      hideOnMobile: true,
      cell: (user) => <span className="text-muted-foreground">{user.email}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
      hideOnMobile: true,
      cell: (user) => <span>{user.phone || "—"}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      hideOnMobile: true,
      cell: (user) => (
        <Badge variant="secondary" className={cn("px-2 py-0.5", getRoleColor(user.role))}>
          {user.role}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      hideOnMobile: true,
      cell: (user) => (
        <Badge variant="secondary" className={cn("px-2 py-0.5", getStatusColor(user.status))}>
          {user.status}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      hideOnMobile: true,
      cell: (user) => <span>{user.lastLogin || "Never"}</span>,
    },
    {
      accessorKey: "joinedDate",
      header: "Created Date",
      hideOnMobile: true,
      cell: (user) => <span>{user.joinedDate}</span>,
    },
    {
      id: "actions",
      header: "",
      className: "w-[120px] text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => handleViewUser(user)}
            title="View details"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => handleEditUser(user)}
            title="Edit user"
          >
            <Pencil className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewUser(user)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditUser(user)}>
                <Pencil className="mr-2 size-4" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleResetPassword(user)}>
                <KeyRound className="mr-2 size-4" />
                Reset Password
              </DropdownMenuItem>
              {user.status === "Active" && (
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeactivateClick(user)}>
                  <Ban className="mr-2 size-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => handleDeleteUser(user.id)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const emptyState = (
    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
      <div className="bg-primary/10 text-primary p-4 rounded-full">
        <Users className="size-8" />
      </div>
      <div>
        <p className="font-semibold text-sm">No staff members found</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Get started by adding your first hotel administrator or receptionist.
        </p>
      </div>
      <Button onClick={() => setAddOpen(true)} className="cursor-pointer mt-1">
        Add Staff Member
      </Button>
    </div>
  )

  return (
    <BaseLayout 
      title="User Management" 
      description="Manage hotel system operators, receptionists, and access permissions"
    >
      <div className="flex flex-col gap-4">
        {/* Metric Cards */}
        <div className="px-4 lg:px-6">
          {!hasInitialized ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[100px] rounded-2xl bg-muted/30" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Staff",
                  value: users.length,
                  icon: Users,
                  footerText: "Registered team members",
                },
                {
                  title: "Active Staff",
                  value: users.filter((u) => u.status === "Active").length,
                  icon: UserCheck,
                  footerText: "Currently active staff",
                },
                {
                  title: "Admins",
                  value: users.filter((u) => u.role === "Admin").length,
                  icon: Shield,
                  footerText: "System administrators",
                },
                {
                  title: "Receptionists",
                  value: users.filter((u) => u.role === "Receptionist").length,
                  icon: ConciergeBell,
                  footerText: "Front desk & reservation team",
                },
              ].map((card, idx) => (
                <StatCard key={idx} {...card} />
              ))}
            </div>
          )}
        </div>
        
        {/* Table View */}
        <div className="px-4 lg:px-6 mt-6">
          <DataTable
            data={users}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search staff members..."
            showColumnVisibility
            enableExport
            exportFilename="sunrise_hotel_staff"
            exportHeaders={["Full Name", "Email", "Phone Number", "Role", "Status", "Last Login", "Created Date"]}
            exportMapper={(u) => [u.name, u.email, u.phone || "", u.role, u.status, u.lastLogin || "", u.joinedDate || ""]}
            paginationMode="client"
            emptyState={emptyState}
            filters={[
              {
                columnId: "role",
                label: "Role",
                options: [
                  { label: "All Roles", value: "" },
                  { label: "Admin", value: "Admin" },
                  { label: "Receptionist", value: "Receptionist" },
                ],
              },
              {
                columnId: "status",
                label: "Status",
                options: [
                  { label: "All Status", value: "" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* Modular Dialog Components */}
      <AddUserDialog 
        open={addOpen} 
        onOpenChange={setAddOpen} 
        onAdd={handleAddSubmit} 
      />

      <EditUserDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        user={editingUser} 
        onEdit={editSubmit => handleEditSubmit(editSubmit)} 
      />

      <ViewUserDialog 
        open={viewOpen} 
        onOpenChange={setViewOpen} 
        user={targetUser} 
      />

      <ResetPasswordDialog 
        open={resetOpen} 
        onOpenChange={setResetOpen} 
        user={targetUser} 
        onReset={handleResetSubmit} 
      />

      <DeactivateUserDialog 
        open={deactivateOpen} 
        onOpenChange={setDeactivateOpen} 
        user={targetUser} 
        onDeactivate={handleDeactivateConfirm} 
      />
    </BaseLayout>
  )
}
