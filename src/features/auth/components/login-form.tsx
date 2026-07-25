"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import React from "react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { loginFormSchema } from "../lib/schemas"
import { GoogleButton } from "./google-button"
import { OtpVerifyForm } from "./otp-verify-form"

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, verifyOtpLogin, verifySecondFactor, isLoading, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)
  const [verificationCode, setVerificationCode] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verifyingMfa, setVerifyingMfa] = React.useState(false)
  const [mfaStrategy, setMfaStrategy] = React.useState<"totp" | "phone_code" | null>(null)
  const [mfaCode, setMfaCode] = React.useState("")
  const [isVerifyingMfa, setIsVerifyingMfa] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate, role])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true)
    try {
      const result = await login(values.email, values.password)
      if (result === true) {
        toast.success("Logged in successfully!", {
          description: "Welcome back to your dashboard panel.",
        })
      } else if (typeof result === "object" && result.status === "needs_second_factor") {
        setMfaStrategy(result.strategy)
        setVerifyingMfa(true)
        toast.info("Multi-factor authentication required.")
      } else {
        setVerifying(true)
        toast.success("Verification code sent to your email.")
      }
    } catch (err: any) {
      console.error("Login Error:", err)
      const clerkError = err.errors?.[0]
      let errorMsg = err.message || "Invalid email or password."
      if (clerkError?.code === "form_identifier_not_found") {
        errorMsg = "Account not found. Please sign up to create a new account."
      } else {
        errorMsg = clerkError?.longMessage || errorMsg
      }
      toast.error(errorMsg)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode) return

    setIsVerifying(true)
    try {
      await verifyOtpLogin(verificationCode)
      toast.success("Device verified successfully!", {
        description: "Welcome back to your dashboard panel.",
      })
      setTimeout(() => navigate("/"), 500)
    } catch (err: any) {
      console.error("Verification Error:", err)
      const clerkError = err.errors?.[0]
      const errorMsg = clerkError?.longMessage || err.message || "Invalid verification code."
      toast.error(errorMsg)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaCode || !mfaStrategy) return

    setIsVerifyingMfa(true)
    try {
      await verifySecondFactor(mfaCode, mfaStrategy)
      toast.success("MFA verification successful!", {
        description: "Welcome back to your dashboard panel.",
      })
    } catch (err: any) {
      console.error("MFA Verification Error:", err)
      const clerkError = err.errors?.[0]
      const errorMsg = clerkError?.longMessage || err.message || "Invalid 2FA code."
      toast.error(errorMsg)
    } finally {
      setIsVerifyingMfa(false)
    }
  }



  if (verifyingMfa) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {mfaStrategy === "totp"
              ? "Enter the 6-digit code from your authenticator application."
              : "We've sent a 6-digit verification code to your registered phone number."}
          </p>
        </div>

        <form onSubmit={handleMfaVerification} className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isVerifyingMfa || mfaCode.length < 6}
            >
              {isVerifyingMfa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setVerifyingMfa(false)}
            >
              Back to login
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (verifying) {
    return (
      <OtpVerifyForm
        title="Verify your device"
        description="Since you are logging in from a new device, we've sent a verification code to your email."
        code={verificationCode}
        setCode={setVerificationCode}
        onSubmit={handleVerification}
        onBack={() => setVerifying(false)}
        submitting={isVerifying}
        submitLabel="Verify Device"
        backLabel="Back to login"
      />
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground text-xs font-medium text-balance">
          Access the SunRise Hotel & Spa Portal
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-1 space-y-0">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="concierge@sunrisehotel.com"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-1 space-y-0">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider">Password</FormLabel>
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:opacity-90 font-semibold underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* This div is required for Clerk Bot Protection (CAPTCHA) */}
            <div id="clerk-captcha" className="flex justify-center" />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest h-11 rounded-xl shadow-md cursor-pointer"
              disabled={isLoggingIn || isLoading}
            >
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In to Sanctuary
            </Button>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t my-2">
              <span className="bg-background text-muted-foreground relative z-10 px-2 text-xs font-semibold">
                Or continue with
              </span>
            </div>

            <GoogleButton mode="login" />
          </div>

          <div className="text-center text-xs text-muted-foreground font-medium">
            Don&apos;t have an account yet?{" "}
            <Link to="/auth/sign-up" className="text-primary hover:opacity-90 font-bold underline underline-offset-4">
              Create Resort Account
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
