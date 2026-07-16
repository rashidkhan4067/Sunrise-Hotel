"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent,CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { useAppStore } from "@/store/use-app-store"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useOrganization } from "@clerk/react"
import { Label } from "@/components/ui/label"

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function UserSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { name, email, avatar } = useCurrentUser()
  const updateUser = useAppStore((state) => state.updateUser)
  const { updateProfile } = useAuth()
  
  const [firstName, lastName] = name.split(" ")
  
  const [profileImage, setProfileImage] = useState<string | null>(avatar || null)
  const [useDefaultIcon, setUseDefaultIcon] = useState(!avatar)

  const { organization } = useOrganization()
  const { role } = useAuth()
  const isAdmin = role === "org:admin"

  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [updatingOrg, setUpdatingOrg] = useState(false)

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name)
      setOrgSlug(organization.slug || "")
    }
  }, [organization])

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return
    setUpdatingOrg(true)
    try {
      await organization.update({
        name: orgName,
        slug: orgSlug,
      })
      toast.success("Organization updated successfully!", {
        description: "Your hotel settings have been saved on Clerk.",
      })
    } catch (err: any) {
      console.error("Org Update Error:", err)
      toast.error(err.message || "Failed to update organization details on Clerk.")
    } finally {
      setUpdatingOrg(false)
    }
  }
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
      phone: "",
      role: "",
    },
  })

  // Synchronize form fields and profile image with live Clerk user profile details once loaded
  useEffect(() => {
    if (name || email) {
      const [first, last] = name.split(" ")
      form.reset({
        firstName: first || "",
        lastName: last || "",
        email: email || "",
        phone: "",
        role: role || "",
      })
      if (avatar) {
        setProfileImage(avatar)
        setUseDefaultIcon(false)
      }
    }
  }, [name, email, avatar, role, form])

  async function onSubmit(data: UserFormValues) {
    try {
      await updateProfile(data.firstName, data.lastName)
      updateUser({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
      })
      toast.success("Profile updated successfully!", {
        description: "Your settings have been saved and dynamically synced to Clerk.",
      })
    } catch (err: any) {
      console.error("Profile Update Error:", err)
      toast.error(err.message || "Failed to update profile details on Clerk.")
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        setUseDefaultIcon(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    setProfileImage(null)
    setUseDefaultIcon(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <BaseLayout title="User Settings" description="Manage your personal information and preferences">
      <div className="px-4 lg:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 ">
              {useDefaultIcon ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg">
                  < Logo size={56} />
                </div>
              ) : (
                <Avatar className="h-20 w-20 rounded-lg">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleFileUpload}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload new photo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReset}
                    className="cursor-pointer"
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allowed JPG, GIF or PNG. Max size of 800K
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/gif,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator className="mb-10" />
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-start gap-3">
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
              <Button variant="outline" type="button" className="cursor-pointer">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
          </form>
        </Form>

        {organization && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Hotel Organization Settings</CardTitle>
              <CardDescription>
                Manage the settings for your hotel workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateOrg} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={organization.imageUrl || undefined} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground font-semibold">
                      {organization.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm">Hotel Logo</h4>
                    <p className="text-xs text-muted-foreground">
                      Managed through Clerk Dashboard
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Sunrise Hotel London"
                      required
                      disabled={!isAdmin || updatingOrg}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="org-slug">Workspace Slug</Label>
                    <Input
                      id="org-slug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      placeholder="e.g. sunrise-london"
                      required
                      disabled={!isAdmin || updatingOrg}
                    />
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="org-id">Organization ID</Label>
                    <Input
                      id="org-id"
                      value={organization.id}
                      readOnly
                      className="bg-muted cursor-not-allowed font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Unique workspace identifier for API connections and database references.
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-start">
                    <Button type="submit" disabled={updatingOrg}>
                      {updatingOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Workspace
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  )
}
