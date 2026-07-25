"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import { useAuth } from "@/contexts/auth-context"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { useDocumentTitle } from "@/hooks/use-document-title"
import { PageHeader, KeyboardShortcutsDialog, ReceptionActionBar } from "@/components/shared"

interface BaseLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  role?: "admin" | "guest"
}

export function BaseLayout({ children, title, description, actions, role }: BaseLayoutProps) {
  useDocumentTitle(title)
  const { config } = useSidebarConfig()
  const location = useLocation()
  const navigate = useNavigate()
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)

  const { role: authRole } = useAuth()

  // Infer role based on URL prefix or auth state if not explicitly passed as prop
  let resolvedRole: "admin" | "receptionist" | "guest" = "guest"
  if (role) {
    resolvedRole = role
  } else if (authRole === "org:admin") {
    resolvedRole = "admin"
  } else if (authRole === "receptionist") {
    resolvedRole = "receptionist"
  } else if (location.pathname.startsWith("/guest")) {
    resolvedRole = "guest"
  } else {
    resolvedRole = "admin"
  }

  const prefix = location.pathname.startsWith("/receptionist") ? "/receptionist" : "/admin"

  // Global Keyboard Hotkeys
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || (activeEl as HTMLElement).isContentEditable)

      if (e.key === "?" && !isInput) {
        e.preventDefault()
        setShortcutsOpen(true)
      } else if (e.key === "/" && !isInput) {
        e.preventDefault()
        const searchInput = document.querySelector("input[placeholder*='Search'], input[type='search'], input") as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      } else if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault()
        navigate(`${prefix}/bookings?action=new`)
      } else if (e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault()
        navigate(`${prefix}/rooms`)
      } else if (e.altKey && (e.key === "g" || e.key === "G")) {
        e.preventDefault()
        navigate(`${prefix}/guests`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate, prefix])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem", 
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
      className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
    >
      {config.side === "left" ? (
        <>
          <AppSidebar 
            variant={config.variant} 
            collapsible={config.collapsible} 
            side={config.side} 
            role={resolvedRole}
          />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <PageHeader title={title} description={description} actions={actions} />
                  {children}
                </div>
              </div>
            </div>
            <SiteFooter />
          </SidebarInset>
        </>
      ) : (
        <>
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <PageHeader title={title} description={description} actions={actions} />
                  {children}
                </div>
              </div>
            </div>
            <SiteFooter />
          </SidebarInset>
          <AppSidebar 
            variant={config.variant} 
            collapsible={config.collapsible} 
            side={config.side} 
            role={resolvedRole}
          />
        </>
      )}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <ReceptionActionBar onOpenShortcuts={() => setShortcutsOpen(true)} />
    </SidebarProvider>
  )
}
