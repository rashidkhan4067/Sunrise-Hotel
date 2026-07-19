"use client"

import { NavLink, useLocation } from "react-router-dom"
import { Building2, User, Sliders, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsTabs() {
  const location = useLocation()
  const path = location.pathname

  const isAdmin = path.startsWith("/admin")
  const prefix = isAdmin ? "/admin/settings" : "/client/settings"

  const tabs = [
    ...(isAdmin
      ? [
          {
            title: "Hotel Profile",
            url: `${prefix}/hotel`,
            icon: Building2,
          },
        ]
      : []),
    {
      title: "My Profile",
      url: `${prefix}/user`,
      icon: User,
    },
    {
      title: "Preferences",
      url: `${prefix}/preferences`,
      icon: Sliders,
    },
    {
      title: "Security",
      url: `${prefix}/password`,
      icon: Lock,
    },
  ]

  return (
    <div className="border-b border-border/40 pb-px mb-6">
      <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = path === tab.url

          return (
            <NavLink
              key={tab.url}
              to={tab.url}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 select-none whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.title}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
