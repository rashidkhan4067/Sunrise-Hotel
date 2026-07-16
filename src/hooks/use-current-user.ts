import { useAuth } from "@/contexts/auth-context"

export function useCurrentUser() {
  const { user: authUser, role } = useAuth()

  return {
    name: authUser?.fullName || authUser?.firstName || "User",
    email:
      authUser?.primaryEmailAddress?.emailAddress ||
      authUser?.emailAddresses?.[0]?.emailAddress ||
      "",
    avatar: authUser?.imageUrl || "",
    role,
  }
}
