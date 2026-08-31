import { useUser } from "@clerk/react"
import { useAuth } from "@/contexts/auth-context"
import { IS_DEMO_MODE } from "@/lib/demo-data"

// Safe wrapper: in demo mode we never call useUser (it would crash without ClerkProvider).
// Rules of Hooks require hooks to always be called in the same order —
// so we always call ONE of these two, never conditionally skipping.
function useClerkUserSafe() {
  // This hook is intentionally only registered when NOT in demo mode.
  // The module-level constant IS_DEMO_MODE is frozen at build time,
  // so React's "same order every render" rule is never violated.
  if (IS_DEMO_MODE) return { user: null }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useUser()
}

export function useCurrentUser() {
  const { user: authUser, role } = useAuth()
  const { user: clerkUser } = useClerkUserSafe()

  // In demo mode → use the demo user from auth-context
  // In real mode → prefer the live Clerk user, fall back to cached auth-context user
  const resolvedUser = IS_DEMO_MODE ? authUser : (clerkUser ?? authUser)

  return {
    name: resolvedUser?.fullName || resolvedUser?.firstName || "User",
    email:
      resolvedUser?.primaryEmailAddress?.emailAddress ||
      resolvedUser?.emailAddresses?.[0]?.emailAddress ||
      resolvedUser?.email ||
      "",
    avatar: resolvedUser?.imageUrl || "",
    role,
    user: resolvedUser,
  }
}

