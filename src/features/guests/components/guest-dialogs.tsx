"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertTriangle } from "lucide-react"
import { guestFormSchema, type GuestFormValues } from "../schemas"
import type { Guest } from "../types"

// Form Field helper
function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Add / Edit Guest Dialog
// ─────────────────────────────────────────────

interface GuestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  guest?: Guest | null
  onSubmit: (values: GuestFormValues) => Promise<void>
}

export function GuestFormDialog({
  open,
  onOpenChange,
  mode,
  guest,
  onSubmit,
}: GuestFormDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema) as any,
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      document_number: "",
      address: "",
    },
  })

  // Reset form when opening or changing target guest
  useEffect(() => {
    if (!open) return
    if (mode === "edit" && guest) {
      reset({
        full_name: guest.full_name,
        phone_number: guest.phone_number,
        email: guest.email || "",
        document_number: guest.document_number,
        address: guest.address || "",
      })
    } else {
      reset({
        full_name: "",
        phone_number: "",
        email: "",
        document_number: "",
        address: "",
      })
    }
    setSubmitError(null)
  }, [open, mode, guest, reset])

  const onValid = async (values: GuestFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === "add" ? "Add Guest Profile" : "Edit Guest Profile"
  const description =
    mode === "add"
      ? "Create a new hotel guest profile. This will make them selectable in booking screens."
      : "Update the guest's contact and document information."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <FormField label="Full Name" htmlFor="full_name" error={errors.full_name?.message}>
            <Input id="full_name" placeholder="John Doe" {...register("full_name")} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" htmlFor="phone_number" error={errors.phone_number?.message}>
              <Input id="phone_number" placeholder="+123456789" {...register("phone_number")} />
            </FormField>

            <FormField label="Email (Optional)" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            </FormField>
          </div>

          <FormField label="CNIC / Passport Number" htmlFor="document_number" error={errors.document_number?.message}>
            <Input id="document_number" placeholder="CNIC/Passport/ID details" {...register("document_number")} />
          </FormField>

          <FormField label="Address (Optional)" htmlFor="address" error={errors.address?.message}>
            <Textarea id="address" placeholder="Physical Address" {...register("address")} />
          </FormField>

          {submitError && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "add" ? "Add Guest" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Delete Guest Dialog
// ─────────────────────────────────────────────

interface DeleteGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  onConfirm: () => Promise<void>
  loading: boolean
}

export function DeleteGuestDialog({
  open,
  onOpenChange,
  guest,
  onConfirm,
  loading,
}: DeleteGuestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            Delete Guest Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Are you sure you want to permanently delete the profile of{" "}
            <strong>{guest?.full_name}</strong>? This action cannot be undone and may affect active bookings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
