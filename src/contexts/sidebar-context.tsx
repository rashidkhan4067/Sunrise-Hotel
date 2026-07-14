"use client"

import * as React from "react"

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset"
  collapsible: "offcanvas" | "icon" | "none"
  side: "left" | "right"
}

export interface SidebarContextValue {
  config: SidebarConfig
  updateConfig: (config: Partial<SidebarConfig>) => void
}

import { STORAGE_KEYS } from "@/config/site-config"

export const SidebarContext = React.createContext<SidebarContextValue | null>(null)

const LOCAL_STORAGE_KEY = STORAGE_KEYS.sidebarConfig

const DEFAULT_CONFIG: SidebarConfig = {
  variant: "inset",
  collapsible: "offcanvas", 
  side: "left"
}

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<SidebarConfig>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_CONFIG
    } catch (e) {
      console.error("Failed to load sidebar config from localStorage:", e)
      return DEFAULT_CONFIG
    }
  })

  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config))
    } catch (e) {
      console.error("Failed to save sidebar config to localStorage:", e)
    }
  }, [config])

  const updateConfig = React.useCallback((newConfig: Partial<SidebarConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarConfig must be used within a SidebarConfigProvider")
  }
  return context
}
