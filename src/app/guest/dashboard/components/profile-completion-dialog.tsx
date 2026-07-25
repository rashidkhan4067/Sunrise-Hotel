import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ProfileCompletionDialogProps {
  open: boolean
  guestId: number
  getToken: () => Promise<string | null>
  onComplete: (updatedGuest: any) => void
}

interface FormValues {
  document_number: string
  phone_number: string
  address: string
}

export function ProfileCompletionDialog({ open, guestId, getToken, onComplete }: ProfileCompletionDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    try {
      const token = await getToken()
      if (!token) throw new Error("Authentication token is missing")
      
      const res = await apiClient.patch<any>(`/guests/${guestId}/`, data, token)
      toast.success("Profile details updated successfully!")
      onComplete(res)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to update profile details.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[450px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Before proceeding, please provide your CNIC/Passport details, contact phone, and residential address. These are required for hotel registration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document_number" className="text-sm font-semibold">CNIC / Passport Number</Label>
            <Input
              id="document_number"
              placeholder="e.g. 42101-1234567-1 or Passport No."
              {...register("document_number", { required: "CNIC or Passport is required" })}
            />
            {errors.document_number && (
              <p className="text-xs text-destructive">{errors.document_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-semibold">Phone Number</Label>
            <Input
              id="phone_number"
              placeholder="e.g. +92 300 1234567"
              {...register("phone_number", { required: "Phone number is required" })}
            />
            {errors.phone_number && (
              <p className="text-xs text-destructive">{errors.phone_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold">Residential Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your street address, city, and country"
              className="resize-none h-20"
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={submitting} className="w-full font-semibold cursor-pointer">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Details...
                </>
              ) : (
                "Submit Details"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
