"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useAppStore } from "@/store/use-app-store"
import {
  BRAND_CONFIG,
  adminNavGroups,
  receptionistNavGroups,
  guestNavGroups,
} from "@/config/site-config"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "admin" | "receptionist" | "guest"
}

export function AppSidebar({ role = "admin", ...props }: AppSidebarProps) {
  const user = useCurrentUser()
  const hotelInfo = useAppStore((state) => state.hotelInfo)

  const brand = {
    name: role === "guest" ? BRAND_CONFIG.guest.name : (hotelInfo?.hotelName || BRAND_CONFIG.admin.name),
    subName: role === "guest" ? BRAND_CONFIG.guest.subName : BRAND_CONFIG.admin.subName,
    logoSize: role === "guest" ? BRAND_CONFIG.guest.logoSize : BRAND_CONFIG.admin.logoSize,
  }

  const navGroups =
    role === "admin"
      ? adminNavGroups
      : role === "receptionist"
        ? receptionistNavGroups
        : guestNavGroups

  const dashboardUrl =
    role === "guest"
      ? "/guest/dashboard"
      : role === "receptionist"
        ? "/receptionist/dashboard"
        : "/admin/dashboard"

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-(--header-height) flex justify-center border-b border-sidebar-border px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-10">
              <Link to={dashboardUrl}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={brand.logoSize} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{brand.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{brand.subName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
