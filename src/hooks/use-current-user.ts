import { useUser } from "@clerk/react"
import { useAuth } from "@/contexts/auth-context"

export function useCurrentUser() {
  const { user } = useUser()
  const { role } = useAuth()

  return {
    name: user?.fullName || user?.firstName || "User",
    email:
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "",
    avatar: user?.imageUrl || "",
    role,
  }
}
