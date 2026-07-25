"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Keyboard, Search, CalendarPlus, BedDouble, Users, HelpCircle } from "lucide-react"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      icon: Search,
      label: "Focus Search Bar",
      keys: ["/"],
      description: "Quickly focus the active table search input"
    },
    {
      icon: CalendarPlus,
      label: "New Reservation",
      keys: ["Alt", "N"],
      description: "Open create booking dialog"
    },
    {
      icon: BedDouble,
      label: "Room Operations",
      keys: ["Alt", "R"],
      description: "Navigate directly to room management"
    },
    {
      icon: Users,
      label: "Guest Directory",
      keys: ["Alt", "G"],
      description: "Navigate to guest profiles"
    },
    {
      icon: HelpCircle,
      label: "Keyboard Shortcuts",
      keys: ["?"],
      description: "Display this hotkey reference dialog"
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-semibold text-base">
            <Keyboard className="h-5 w-5" />
            <span>Front Desk Keyboard Hotkeys</span>
          </DialogTitle>
          <DialogDescription>
            Speed up reception desk operations with quick keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.label}
              className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-border/50"
            >
              <div className="flex items-center gap-3">
                <sc.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">{sc.label}</div>
                  <div className="text-xs text-muted-foreground">{sc.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {sc.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 text-xs font-mono font-semibold text-muted-foreground bg-background border border-border rounded shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
