import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { RouteProgress } from "@/components/route-progress"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  console.log("[ProtectedRoute]", { isAuthenticated, isLoading })

  if (isLoading) {
    return <RouteProgress />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return <>{children}</>
}
