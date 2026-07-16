import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface GoogleButtonProps {
  mode: "login" | "register"
}

export function GoogleButton({ mode }: GoogleButtonProps) {
  const { loginWithGoogle, registerWithGoogle } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const handleOAuth = async () => {
    setSubmitting(true)
    try {
      if (mode === "login") {
        await loginWithGoogle()
      } else {
        await registerWithGoogle()
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err)
      toast.error(`Failed to ${mode} with Google.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full cursor-pointer animate-all"
      onClick={handleOAuth}
      disabled={submitting}
    >
      {submitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          />
        </svg>
      )}
      {mode === "login" ? "Login with Google" : "Sign up with Google"}
    </Button>
  )
}
