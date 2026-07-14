"use client"

import React, { createContext, useContext, useState } from "react"
import { STORAGE_KEYS } from "@/config/site-config"

interface AuthContextType {
  isAuthenticated: boolean
  login: (rememberMe?: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = STORAGE_KEYS.authSession

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(SESSION_KEY) === "true" ||
        localStorage.getItem(SESSION_KEY) === "true"
      )
    } catch {
      return false
    }
  })

  const login = async (rememberMe?: boolean) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsAuthenticated(true)
    try {
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, "true")
      } else {
        sessionStorage.setItem(SESSION_KEY, "true")
      }
    } catch (e) {
      console.error("Failed to persist auth status:", e)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    try {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
    } catch (e) {
      console.error("Failed to clear auth status:", e)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
