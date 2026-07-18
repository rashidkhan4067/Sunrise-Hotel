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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import React from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { signupFormSchema } from "../lib/schemas"
import { GoogleButton } from "./google-button"
import { OtpVerifyForm } from "./otp-verify-form"

type SignupFormValues = z.infer<typeof signupFormSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, verifyOtp, isLoading, isAuthenticated, signUp, role } = useAuth()
  const [isSigningUp, setIsSigningUp] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)
  const [verificationCode, setVerificationCode] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isAuthenticated) {
      if (
        window.location.hash.includes("choose-organization") || 
        window.location.href.includes("choose-organization")
      ) {
        return
      }
      const redirectPath = role === "org:admin" ? "/admin/dashboard" : "/client/dashboard"
      navigate(redirectPath)
    }
  }, [isAuthenticated, navigate, role])

  const isOAuthIncomplete = !isLoading && signUp?.status === "missing_requirements"

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  React.useEffect(() => {
    // If we're returned here with a partially completed sign up (e.g. from Google OAuth missing a required field)
    if (!isLoading && signUp && signUp.emailAddress && !verifying) {
      if (signUp.status === "missing_requirements") {
        toast.info("Almost there!", {
          description: `Please complete the remaining required fields to finish creating your account for ${signUp.emailAddress}.`,
        })
      } else {
        toast.info("Account not found", {
          description: `No account exists for ${signUp.emailAddress} yet. Please complete your registration below.`,
        })
      }
      
      if (signUp.emailAddress) form.setValue("email", signUp.emailAddress)
      if (signUp.firstName) form.setValue("firstName", signUp.firstName)
      if (signUp.lastName) form.setValue("lastName", signUp.lastName)
    }
  }, [isLoading, signUp, verifying, form])

  const onSubmit = async (values: SignupFormValues) => {
    setIsSigningUp(true)
    try {
      const needsVerification = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      })

      if (needsVerification) {
        setVerifying(true)
        toast.info("Verification code sent!", {
          description: `We've sent a 6-digit code to ${values.email}.`,
        })
      } else {
        toast.success("Account created successfully!", {
          description: "Welcome to SunRise Hotel.",
        })
      }
    } catch (err: any) {
      console.error("Sign-up Error:", err)
      const errorMsg = err.message || "Failed to create account."
      toast.error(errorMsg)
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length < 4) {
      toast.error("Please enter a valid verification code.")
      return
    }

    setIsVerifying(true)
    try {
      await verifyOtp(verificationCode)
      toast.success("Account created successfully!", {
        description: "Welcome to SunRise Hotel.",
      })
      const redirectPath = role === "org:admin" ? "/admin/dashboard" : "/client/dashboard"
      setTimeout(() => navigate(redirectPath), 500)
    } catch (err: any) {
      console.error("Verification Error:", err)
      const errorMsg = err.message || "Invalid verification code."
      toast.error(errorMsg)
    } finally {
      setIsVerifying(false)
    }
  }



  // Render Verification OTP form if verifying
  if (verifying) {
    return (
      <OtpVerifyForm
        title="Verify your email"
        description="Please enter the 6-digit verification code sent to your email."
        code={verificationCode}
        setCode={setVerificationCode}
        onSubmit={handleVerifySubmit}
        onBack={() => setVerifying(false)}
        submitting={isVerifying}
        submitLabel="Confirm Verification"
        backLabel="Back to Sign Up"
      />
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {isOAuthIncomplete 
            ? `Set a password to complete your account for ${signUp?.emailAddress}`
            : "Create your management account"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {!isOAuthIncomplete && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="grid gap-1 space-y-0">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="grid gap-1 space-y-0">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-1 space-y-0">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-1 space-y-0">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid gap-1 space-y-0">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0 py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </a>
                </FormLabel>
              </FormItem>
            )}
          />

          {/* This div is required for Clerk Bot Protection (CAPTCHA) */}
          <div id="clerk-captcha" className="flex justify-center" />

          <Button
            type="submit"
            className="w-full cursor-pointer animate-all"
            disabled={isSigningUp || isLoading}
          >
            {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          {!isOAuthIncomplete && (
            <>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t my-2">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <GoogleButton mode="register" />
            </>
          )}

          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="underline underline-offset-4">
              Sign in
            </a>
          </div>
        </form>
      </Form>
    </div>
  )
}
