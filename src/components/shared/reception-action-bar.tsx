"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Plus, BedDouble, Users, Keyboard, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface ReceptionActionBarProps {
  onOpenShortcuts?: () => void
}

export function ReceptionActionBar({ onOpenShortcuts }: ReceptionActionBarProps) {
  const { role } = useAuth()
  const navigate = useNavigate()

  if (role !== "ADMIN" && role !== "RECEPTIONIST") {
    return null
  }

  const prefix = role === "ADMIN" ? "/admin" : "/receptionist"

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/60 shadow-xl print:hidden transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Front-Desk Deskbar</span>
      </div>

      <div className="h-4 w-px bg-border/60" />

      {/* New Reservation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`${prefix}/bookings`)}
        className="h-8 rounded-full px-3 text-xs gap-1.5 font-semibold hover:bg-primary/10 hover:text-primary"
        title="New Reservation (Alt+N)"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Bookings</span>
      </Button>

      {/* Room Ops */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`${prefix}/rooms`)}
        className="h-8 rounded-full px-3 text-xs gap-1.5 font-semibold hover:bg-primary/10 hover:text-primary"
        title="Room Operations (Alt+R)"
      >
        <BedDouble className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Rooms</span>
      </Button>

      {/* Guests */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`${prefix}/guests`)}
        className="h-8 rounded-full px-3 text-xs gap-1.5 font-semibold hover:bg-primary/10 hover:text-primary"
        title="Guest Directory (Alt+G)"
      >
        <Users className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Guests</span>
      </Button>

      {/* Hotkeys */}
      {onOpenShortcuts && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenShortcuts}
          className="h-8 rounded-full px-2.5 text-xs gap-1 font-mono font-semibold"
          title="Keyboard Hotkeys (?)"
        >
          <Keyboard className="h-3.5 w-3.5" />
          <span>?</span>
        </Button>
      )}
    </div>
  )
}
