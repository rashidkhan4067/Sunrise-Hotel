"use client"

import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"
import {
  User,
  Settings,
  CreditCard,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react"

export function UserNav() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { name, email, avatar } = useCurrentUser()

  const initials = getInitials(name)

  const handleLogout = async () => {
    await logout()
    toast.success("Signed out successfully")
    navigate("/auth/sign-in")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-9 px-2 rounded-full cursor-pointer hover:bg-accent"
        >
          <Avatar className="h-7 w-7 ring-2 ring-border">
            {avatar && <AvatarImage src={avatar} alt={name} />}
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
            {name}
          </span>
          <ChevronDown className="hidden md:block size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              {avatar && <AvatarImage src={avatar} alt={name} />}
              <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/settings/user")} className="cursor-pointer gap-2">
            <User className="size-4 text-muted-foreground" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings/account")} className="cursor-pointer gap-2">
            <Settings className="size-4 text-muted-foreground" />
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings/billing")} className="cursor-pointer gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings/notifications")} className="cursor-pointer gap-2">
            <Bell className="size-4 text-muted-foreground" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
