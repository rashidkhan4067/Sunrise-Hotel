import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BadgeInfo } from "lucide-react"
import type { User } from "../types"


interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeInfo className="size-5 text-primary" />
            Staff Profile Details
          </DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full overflow-hidden border">
                <img
                  src={user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:"))
                    ? user.avatar
                    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{user.name}</h4>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Phone Number</span>
                <span>{user.phone || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Status</span>
                <span className={user.status === "Active" ? "text-green-600 font-medium" : "text-muted-foreground font-medium"}>
                  {user.status}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Role Privilege</span>
                <span>{user.role}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Created Date</span>
                <span>{user.joinedDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Last Console Activity</span>
                <span>{user.lastLogin || "Never logged in"}</span>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Close View</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
