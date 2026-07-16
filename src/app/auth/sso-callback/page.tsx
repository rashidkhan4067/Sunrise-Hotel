import { AuthenticateWithRedirectCallback } from "@clerk/react"

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Completing authentication...</p>
        <AuthenticateWithRedirectCallback 
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          continueSignUpUrl="/auth/sign-up"
        />
      </div>
    </div>
  )
}
