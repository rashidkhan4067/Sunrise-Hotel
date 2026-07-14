"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

// Compact breadcrumb-style page indicator in header
function HeaderPageIndicator() {
  const location = useLocation()
  const segments = location.pathname.replace(/^\//, "").split("/").filter(Boolean)
  const pageTitle = segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ")

  if (!pageTitle) return null

  return (
    <span className="hidden lg:block text-xs text-muted-foreground font-medium tracking-wide border-l pl-3 ml-1">
      {pageTitle}
    </span>
  )
}

// Dot status indicator
function StatusDot({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span className="hidden xl:inline">Live</span>
    </span>
  )
}

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { isAuthenticated } = useAuth()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150 shadow-sm transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-2 px-4 lg:px-6">

          {/* LEFT: Sidebar trigger + brand crumb */}
          <div className="flex items-center gap-1 min-w-0 shrink-0">
            <SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
            <HeaderPageIndicator />
          </div>

          {/* CENTER: Search bar */}
          <div className="flex-1 flex items-center justify-center">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          {/* RIGHT: Status + actions */}
          <div className="flex items-center gap-1 shrink-0">
            <StatusDot className="mr-2 hidden sm:inline-flex" />

            {isAuthenticated && (
              <>
                <NotificationBell />
                <ModeToggle variant="ghost" />
                <Separator orientation="vertical" className="h-4 mx-1" />
                <UserNav />
              </>
            )}
            {!isAuthenticated && <ModeToggle variant="ghost" />}
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
