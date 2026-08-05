"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/components/layouts/base-layout"
import { SettingsTabs } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useUser } from "@clerk/react"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { IS_DEMO_MODE } from "@/lib/demo-data"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function PasswordSettingsPage() {
  // In demo mode, skip Clerk's useUser entirely
  const clerkData = IS_DEMO_MODE ? { user: null } : useUser() // eslint-disable-line react-hooks/rules-of-hooks
  const user = clerkData.user
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPasswordValue = form.watch("newPassword") || ""

  // Password strength check rules
  const strengthRules = [
    { label: "At least 8 characters", test: newPasswordValue.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", test: /[A-Z]/.test(newPasswordValue) },
    { label: "At least one lowercase letter (a-z)", test: /[a-z]/.test(newPasswordValue) },
    { label: "At least one number (0-9)", test: /[0-9]/.test(newPasswordValue) },
    { label: "At least one special character (e.g., @, #, $, %)", test: /[^A-Za-z0-9]/.test(newPasswordValue) },
  ]

  const passedCount = strengthRules.filter((rule) => rule.test).length

  async function onSubmit(values: PasswordFormValues) {
    setSaving(true)
    try {
      if (IS_DEMO_MODE) {
        await new Promise(r => setTimeout(r, 600))
        toast.success("Password updated! (Demo)", {
          description: "In demo mode, passwords are not actually changed.",
        })
        form.reset()
        return
      }

      if (!user) {
        throw new Error("User session not loaded. Please try again.")
      }

      await user.updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      toast.success("Password updated successfully!", {
        description: "Your login credentials have been updated.",
      })
      form.reset()
    } catch (err: any) {
      console.error("Password update error:", err)
      const errorMsg = err.errors?.[0]?.longMessage || err.message || "Failed to update password."
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BaseLayout title="Security Settings" description="Change your password to keep your account secure.">
      <div className="px-4 lg:px-6 max-w-2xl space-y-6">
        <SettingsTabs />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Enter your current password and choose a strong new password.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Current Password */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showCurrent ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* New Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showNew ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Real-time Strength Indicator */}
                {newPasswordValue && (
                  <div className="rounded-lg bg-muted/30 border p-3.5 space-y-2 text-xs">
                    <p className="font-semibold text-muted-foreground">Password strength rules:</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {strengthRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={`size-1.5 rounded-full ${rule.test ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                          <span className={rule.test ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            passedCount <= 2 ? "bg-red-500 w-[20%]" : 
                            passedCount <= 4 ? "bg-yellow-500 w-[60%]" : "bg-emerald-500 w-full"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirm ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseLayout>
  )
}
