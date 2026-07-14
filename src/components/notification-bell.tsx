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

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  icon: "mail" | "task" | "alert"
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New message received",
    description: "William Kim sent you an email about the project.",
    time: "2 min ago",
    read: false,
    icon: "mail",
  },
  {
    id: "2",
    title: "Task deadline approaching",
    description: "\"Fix production bug\" is due in 1 hour.",
    time: "1 hr ago",
    read: false,
    icon: "task",
  },
  {
    id: "3",
    title: "System alert",
    description: "Scheduled maintenance starts at 11:00 PM tonight.",
    time: "3 hr ago",
    read: false,
    icon: "alert",
  },
  {
    id: "4",
    title: "New sign-in detected",
    description: "A login was detected from Windows, Chrome.",
    time: "Yesterday",
    read: true,
    icon: "alert",
  },
]

const NotificationIcon = ({ type }: { type: Notification["icon"] }) => {
  if (type === "mail") return <Mail className="size-4 text-blue-500 flex-shrink-0" />
  if (type === "task") return <CheckSquare className="size-4 text-green-500 flex-shrink-0" />
  return <AlertCircle className="size-4 text-amber-500 flex-shrink-0" />
}

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
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
                onSelect={(e) => e.preventDefault()}
              >
                <div className="mt-0.5">
                  <NotificationIcon type={notification.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
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
