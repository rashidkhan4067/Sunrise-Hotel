import { useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { RouteProgress } from "@/components/route-progress"

interface StaffRouteProps {
  children: ReactNode
}

export function StaffRoute({ children }: StaffRouteProps) {
  const { role, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const isStaff = role === "org:admin" || role === "receptionist"

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      navigate("/auth/sign-in")
      return
    }

    if (!isStaff) {
      toast.error("Permission Denied", {
        description: "You do not have staff or administrator access to this page.",
      })
      navigate("/guest/dashboard")
    }
  }, [isStaff, isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return <RouteProgress />
  }

  if (!isAuthenticated || !isStaff) {
    return null
  }

  return <>{children}</>
}
