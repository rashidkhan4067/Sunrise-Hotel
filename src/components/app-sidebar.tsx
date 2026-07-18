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
import {
  BRAND_CONFIG,
  adminNavGroups,
  receptionistNavGroups,
  clientNavGroups,
} from "@/config/site-config"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "admin" | "receptionist" | "client"
}

export function AppSidebar({ role = "admin", ...props }: AppSidebarProps) {
  const user = useCurrentUser()

  const brand = role === "client" ? BRAND_CONFIG.client : BRAND_CONFIG.admin

  const navGroups =
    role === "admin"
      ? adminNavGroups
      : role === "receptionist"
        ? receptionistNavGroups
        : clientNavGroups

  const dashboardUrl =
    role === "client" ? "/client/dashboard" : "/admin/dashboard"

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
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
