"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { useDocumentTitle } from "@/hooks/use-document-title"
import { PageHeader } from "@/components/shared"

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

  // Infer role based on URL prefix if not explicitly passed as prop
  const activeRole = role || (location.pathname.startsWith("/guest") ? "guest" : "admin")

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
            role={activeRole}
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
            role={activeRole}
          />
        </>
      )}
    </SidebarProvider>
  )
}
