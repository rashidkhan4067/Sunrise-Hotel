import { useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { RouteProgress } from "@/components/route-progress"

interface GuestRouteProps {
  children: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { role, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const isGuest = role !== "org:admin" && role !== "receptionist"

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      navigate("/auth/sign-in")
      return
    }

    if (!isGuest) {
      if (role === "org:admin") {
        navigate("/admin/dashboard")
      } else if (role === "receptionist") {
        navigate("/receptionist/dashboard")
      }
    }
  }, [isGuest, role, isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return <RouteProgress />
  }

  if (!isAuthenticated || !isGuest) {
    return null
  }

  return <>{children}</>
}
