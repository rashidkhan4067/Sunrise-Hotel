import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import type { User } from "../types"


interface DeactivateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onDeactivate: () => void
}

export function DeactivateUserDialog({ open, onOpenChange, user, onDeactivate }: DeactivateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <ShieldAlert className="size-5" />
            Deactivate User Account?
          </DialogTitle>
          <DialogDescription>
            Deactivating this account will immediately revoke all access rights to the SunRise Hotel console for {user?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2 flex justify-end gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" className="cursor-pointer" onClick={onDeactivate}>Deactivate Account</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
