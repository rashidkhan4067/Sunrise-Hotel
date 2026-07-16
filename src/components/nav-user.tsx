"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getInitials } from "@/lib/utils"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const initials = getInitials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Static user identity card — actions are available in the header UserNav */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="h-8 w-8 ring-2 ring-border shrink-0">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
            <span className="truncate font-medium text-sm">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
