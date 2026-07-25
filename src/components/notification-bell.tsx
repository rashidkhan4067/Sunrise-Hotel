"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, CheckSquare, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { formatDistanceToNow } from "date-fns"
import { useNavigate } from "react-router-dom"

interface Notification {
  id: string
  title: string
  description: string
  created_at: string
  is_read: boolean
  icon: "mail" | "task" | "alert" | "booking"
}



const NotificationIcon = ({ type }: { type: Notification["icon"] }) => {
  if (type === "mail") return <Mail className="size-4 text-blue-500 flex-shrink-0" />
  if (type === "task") return <CheckSquare className="size-4 text-green-500 flex-shrink-0" />
  if (type === "booking") return <CheckSquare className="size-4 text-primary flex-shrink-0" />
  return <AlertCircle className="size-4 text-amber-500 flex-shrink-0" />
}

export function NotificationBell() {
  const { getToken, role } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Real-time Server-Sent Events (SSE) Listener
  React.useEffect(() => {
    let active = true
    let eventSource: EventSource | null = null

    async function initStream() {
      const token = await getToken()
      if (!token || !active) return

      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
      try {
        eventSource = new EventSource(`${apiBase}/notifications/stream/`)
        eventSource.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data)
            if (payload.data?.description) {
              toast.info(`[Real-time Update] ${payload.data.description}`)
              queryClient.invalidateQueries({ queryKey: ["notifications"] })
              queryClient.invalidateQueries({ queryKey: ["dashboard"] })
              queryClient.invalidateQueries({ queryKey: ["rooms"] })
              queryClient.invalidateQueries({ queryKey: ["bookings"] })
            }
          } catch (err) {
            // silent catch
          }
        }
      } catch (err) {
        // SSE fallback
      }
    }

    initStream()

    return () => {
      active = false
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [getToken, queryClient])

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      return apiClient.get<Notification[]>("notifications/", token)
    },
    refetchInterval: () => (typeof document !== "undefined" && document.hidden ? false : 15000),
    staleTime: 10000,
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiClient.patch(`notifications/${id}/mark-read/`, {}, token || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return apiClient.post(`notifications/mark-all-read/`, {}, token || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
    }
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAllRead = () => {
    markAllReadMutation.mutate()
  }

  const dismissNotification = (id: string) => {
    markReadMutation.mutate(id)
  }

  const handleNotificationClick = (notification: Notification) => {
    console.log("[NotificationBell] Notification clicked:", notification)
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id)
    }

    const titleLower = notification.title.toLowerCase()
    if (titleLower.includes("support") || titleLower.includes("message") || titleLower.includes("ticket")) {
      const supportPath = role === "guest" ? "/guest/support" : (role === "receptionist" ? "/receptionist/support" : "/admin/support")
      navigate(supportPath)
      return
    }

    if (notification.icon?.toLowerCase() === "booking" || titleLower.includes("booking")) {
      const targetPath = role === "org:admin" ? "/admin/bookings" : (role === "receptionist" ? "/receptionist/bookings" : "/guest/bookings")
      console.log("[NotificationBell] Navigating to:", targetPath)
      navigate(targetPath)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 cursor-pointer rounded-md">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px]" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <div>
            <p className="font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary cursor-pointer"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-0.5">No new notifications</p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 px-3 py-3 cursor-pointer focus:bg-accent/50 group"
                onSelect={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest('.dismiss-btn')) {
                    e.preventDefault()
                  } else {
                    handleNotificationClick(notification)
                  }
                }}
              >
                <div className="mt-0.5">
                  <NotificationIcon type={notification.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer dismiss-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    dismissNotification(notification.id)
                  }}
                >
                  <X className="size-3" />
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
