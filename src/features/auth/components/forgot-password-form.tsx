"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { useClerk } from "@clerk/react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { forgotPasswordEmailSchema, strongPasswordSchema } from "../lib/schemas"
import { IS_DEMO_MODE } from "@/lib/demo-data"

type EmailValues = z.infer<typeof forgotPasswordEmailSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // In demo mode, skip useClerk (it crashes without <ClerkProvider>)
  const clerk = IS_DEMO_MODE ? null : useClerk() // eslint-disable-line react-hooks/rules-of-hooks
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [userEmail, setUserEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeSignInAttempt, setActiveSignInAttempt] = useState<any>(null)

  // Step 2 Form States
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Redirect immediately if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate, role])

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  })

  const validatePassword = (pass: string) => {
    if (!pass) return "Password is required"
    const result = strongPasswordSchema.safeParse(pass)
    if (!result.success) {
      return result.error.issues[0].message
    }
    return ""
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    if (val) {
      setPasswordError(validatePassword(val))
    } else {
      setPasswordError("")
    }
  }

  const onEmailSubmit = async (values: EmailValues) => {
    setSubmitting(true)
    try {
      if (IS_DEMO_MODE || !clerk) {
        await new Promise((r) => setTimeout(r, 600))
        setUserEmail(values.email)
        setStep(2)
        toast.success("Verification code sent! (Demo Mode)", {
          description: `We sent a 6-digit code to ${values.email}.`,
        })
        return
      }

      // Start password reset flow in Clerk
      const signInAttempt = await clerk.client.signIn.create({
        identifier: values.email,
      })
      setActiveSignInAttempt(signInAttempt)

      const resetFactor = signInAttempt.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === "reset_password_email_code"
      ) as any

      if (!resetFactor) {
        throw new Error("Password reset email code strategy is not enabled for this application.")
      }

      await signInAttempt.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetFactor.emailAddressId,
      })
      
      setUserEmail(values.email)
      setStep(2)
      toast.success("Verification code sent!", {
        description: `We sent a 6-digit code to ${values.email}.`,
      })
    } catch (err: any) {
      console.error("Forgot Password Error:", err)
      const clerkError = err.errors?.[0]

      // Advanced Session Recovery (already signed in)
      if (clerkError?.code === "session_exists" || err.message?.includes("already signed in")) {
        const sid = clerkError?.meta?.sessionId || clerk?.client?.sessions?.[0]?.id
        if (sid && clerk) {
          await clerk.setActive({ session: sid })
          toast.success("You are already signed in.", {
            description: "Redirecting you to the dashboard.",
          })
          navigate("/")
          return
        }
      }

      // Advanced Anti-Email-Enumeration (Silent Success)
      if (clerkError?.code === "form_identifier_not_found") {
        setUserEmail(values.email)
        setStep(2)
        toast.success("Verification code sent!", {
          description: `If an account exists for ${values.email}, we sent a 6-digit code to it.`,
        })
      } else {
        const errorMsg = clerkError?.longMessage || err.message || "Failed to send verification code."
        toast.error(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErr = validatePassword(password)
    if (validationErr) {
      setPasswordError(validationErr)
      toast.error(validationErr)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      if (IS_DEMO_MODE || !clerk) {
        await new Promise((r) => setTimeout(r, 600))
        toast.success("Password reset successfully! (Demo Mode)", {
          description: "Welcome to your Dashboard.",
        })
        setTimeout(() => navigate("/auth/sign-in"), 500)
        return
      }

      const signInAttempt = activeSignInAttempt || clerk.client?.signIn
      if (!signInAttempt) {
        throw new Error("No active password reset attempt found. Please request a code first.")
      }

      const result = await signInAttempt.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId })
        toast.success("Password reset successfully!", {
          description: "Welcome to your Dashboard.",
        })
        setTimeout(() => navigate("/"), 500)
      } else {
        throw new Error(`Process incomplete: Status is ${result.status}`)
      }
    } catch (err: any) {
      console.error("Verification Error:", err)
      const clerkError = err.errors?.[0]

      if (clerkError?.code === "session_exists" || err.message?.includes("already signed in")) {
        const sid = clerkError?.meta?.sessionId || clerk?.client?.sessions?.[0]?.id
        if (sid && clerk) {
          await clerk.setActive({ session: sid })
          toast.success("You are already signed in.", {
            description: "Redirecting you to the dashboard.",
          })
          navigate("/")
          return
        }
      }

      const errorMsg = clerkError?.longMessage || err.message || "Invalid verification code."
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 1) {
    return (
      <div key="step-1" className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <h1 className="text-2xl font-bold font-heading">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email address and we'll send you a 6-digit code to reset your password
          </p>
        </div>

        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="grid gap-6">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-1 space-y-0">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" type="email" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full cursor-pointer animate-all py-5" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Code
            </Button>
            <div className="text-center text-sm md:text-left">
              Remember your password?{" "}
              <a href="/auth/sign-in" className="underline underline-offset-4 hover:text-primary">
                Back to sign in
              </a>
            </div>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <div key="step-2" className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
        <h1 className="text-2xl font-bold font-heading">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          We sent a code to <span className="font-semibold text-foreground">{userEmail}</span>. Enter it below along with your new password.
        </p>
      </div>

      <form onSubmit={onResetSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            disabled={submitting}
          />
          {passwordError && (
            <p className="text-destructive text-xs leading-relaxed max-w-xs whitespace-pre-line">
              {passwordError}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <Button type="submit" className="w-full cursor-pointer animate-all py-5 mt-2" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>

        <Button
          variant="ghost"
          type="button"
          className="w-full"
          onClick={() => setStep(1)}
          disabled={submitting}
        >
          Request a new code
        </Button>
      </form>
    </div>
  )
}
