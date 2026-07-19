"use client"

import { useNavigate } from "react-router-dom"
import { Calendar, ClipboardList, User, HelpCircle, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function GuestQuickActions() {
  const navigate = useNavigate()

  const quickActions = [
    {
      title: "Book a Room",
      description: "Book another room or extend your stay with us.",
      icon: Calendar,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      onClick: () => navigate("/guest/bookings?action=new"),
      actionText: "Book Now"
    },
    {
      title: "My Reservations",
      description: "View details, receipts, and status of your stays.",
      icon: ClipboardList,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      onClick: () => navigate("/guest/bookings"),
      actionText: "View Stays"
    },
    {
      title: "Profile & ID Settings",
      description: "Manage contact information and identity documents.",
      icon: User,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      onClick: () => navigate("/guest/settings/user"),
      actionText: "Manage Profile"
    },
    {
      title: "Support Desk",
      description: "Contact reception or submit a request directly.",
      icon: HelpCircle,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      onClick: () => toast.info("Front desk alerted. A receptionist will contact you shortly!"),
      actionText: "Alert Reception"
    }
  ]

  return (
    <div>
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary" />
        Guest Services
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, i) => (
          <div 
            key={i} 
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 bg-card/60"
          >
            <div className="space-y-4">
              <div className={`inline-flex rounded-lg p-2.5 border ${action.color}`}>
                <action.icon className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{action.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
              </div>
            </div>
            <div 
              className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-primary cursor-pointer hover:underline"
              onClick={action.onClick}
            >
              <span>{action.actionText}</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
