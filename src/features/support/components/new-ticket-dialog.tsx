import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LifeBuoy, Loader2 } from "lucide-react"

interface NewTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { subject: string; category: string; priority: string; initial_message: string }) => Promise<void>
  initialCategory?: string
  initialSubject?: string
  initialMessage?: string
}

export function NewTicketDialog({
  open,
  onOpenChange,
  onSubmit,
  initialCategory = "GENERAL",
  initialSubject = "",
  initialMessage = "",
}: NewTicketDialogProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [category, setCategory] = useState(initialCategory)
  const [priority, setPriority] = useState("MEDIUM")
  const [message, setMessage] = useState(initialMessage)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        subject: subject.trim(),
        category,
        priority,
        initial_message: message.trim(),
      })
      setSubject("")
      setMessage("")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <LifeBuoy className="size-5 text-primary" />
              Submit In-House Guest Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Need extra amenities, room service, or billing assistance? Direct to reception.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Subject / Item Requested</label>
              <Input
                placeholder="E.g., Request Extra Pillows & Towels"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="text-xs bg-muted/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="text-xs bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                    <SelectItem value="ROOM_SERVICE">Room Service</SelectItem>
                    <SelectItem value="BILLING">Billing & Folio</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="GENERAL">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Priority Level</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="text-xs bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Request Details</label>
              <Textarea
                placeholder="Describe your request in detail for the hotel staff..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="text-xs min-h-[90px] bg-muted/20"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="cursor-pointer bg-primary font-bold text-xs h-8 gap-1.5"
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
