import { AuthenticateWithRedirectCallback } from "@clerk/react"
import { IS_DEMO_MODE } from "@/lib/demo-data"
import { Navigate } from "react-router-dom"

export default function SSOCallbackPage() {
  // SSO is disabled in demo mode — redirect to home
  if (IS_DEMO_MODE) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Completing authentication...</p>
        <AuthenticateWithRedirectCallback 
          signInForceRedirectUrl="/"
          signUpForceRedirectUrl="/"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          continueSignUpUrl="/auth/sign-up"
        />
        {/* Mount container for Clerk's Bot Sign Up Protection (Turnstile CAPTCHA) */}
        <div id="clerk-captcha" className="mt-2" />
      </div>
    </div>
  )
}
