"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/components/layouts/base-layout"
import { SettingsTabs } from "@/components/shared"
import { useAppStore } from "@/store/use-app-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Settings, Sliders, Loader2 } from "lucide-react"

const preferencesFormSchema = z.object({
  defaultCheckoutStatus: z.string(),
  autoAssignRooms: z.boolean(),
  cancellationPolicy: z.string(),
  emailAlerts: z.boolean(),
  appAlerts: z.boolean(),
  autoCleanupAlerts: z.boolean(),
})

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>

export default function PreferencesSettingsPage() {
  const [saving, setSaving] = useState(false)
  const preferences = useAppStore((state) => state.preferences)
  const updatePreferences = useAppStore((state) => state.updatePreferences)

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: preferences,
  })

  useEffect(() => {
    if (preferences) {
      form.reset(preferences)
    }
  }, [preferences, form])

  function onSubmit(values: PreferencesFormValues) {
    setSaving(true)
    try {
      updatePreferences(values)
      toast.success("System preferences updated!", {
        description: "Your system rules, theme settings, and alerts have been saved.",
      })
    } catch (err) {
      toast.error("Failed to save system preferences.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <BaseLayout title="System Preferences" description="Configure core hotel workflows, notification rules, and default templates.">
      <div className="px-4 lg:px-6 max-w-4xl space-y-6">
        <SettingsTabs />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Operational Preferences Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Sliders className="size-5" />
                </div>
                <div>
                  <CardTitle>Operational Workflows</CardTitle>
                  <CardDescription>Setup default statuses and booking configuration parameters.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="defaultCheckoutStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Status after Guest Check-out</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Available (Instant Ready)</SelectItem>
                            <SelectItem value="dirty">Needs Cleaning (Dirty)</SelectItem>
                            <SelectItem value="maintenance">Under Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The default status applied to a room as soon as checkout completes.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Cancellation Policy</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cancellation policy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="24h">Free up to 24 hours prior</SelectItem>
                            <SelectItem value="48h">Free up to 48 hours prior</SelectItem>
                            <SelectItem value="non-refundable">Non-Refundable</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Standard room package rules applied during new room booking.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="autoAssignRooms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Assign Rooms to Bookings</FormLabel>
                        <FormDescription>
                          Automatically assign the best available room of requested type during guest check-in.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notification and System Alerts Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Settings className="size-5" />
                </div>
                <div>
                  <CardTitle>System Notifications & Alerts</CardTitle>
                  <CardDescription>Choose how you want to be notified of critical occurrences.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <FormField
                  control={form.control}
                  name="emailAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Send daily hotel reports, checkout summaries, and revenue digests to hotel admin email.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Browser Desktop Alerts</FormLabel>
                        <FormDescription>
                          Show push notifications for new guest reservations, cleaning requests, and check-ins.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoCleanupAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automatic History Cleanups</FormLabel>
                        <FormDescription>
                          Automatically delete cancelled reservations logs older than 180 days to free up space.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseLayout>
  )
}
const Separator = () => <div className="h-px bg-border my-6" />
