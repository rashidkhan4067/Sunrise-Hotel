import { useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { RouteProgress } from "@/components/route-progress"

interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { role, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const isAdmin = role === "org:admin"

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      navigate("/auth/sign-in")
      return
    }

    if (!isAdmin) {
      toast.error("Permission Denied", {
        description: "You do not have administrator access to this page.",
      })
      navigate("/guest/dashboard")
    }
  }, [isAdmin, isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return <RouteProgress />
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <>{children}</>
}
