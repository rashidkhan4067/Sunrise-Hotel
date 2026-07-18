"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { 
  Calendar, 
  CreditCard, 
  User, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Wifi,
  UtensilsCrossed,
  Waves
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.firstName || "Guest"

  const quickActions = [
    {
      title: "Book a Room",
      description: "Find and book your next stay with us.",
      icon: Calendar,
      color: "bg-blue-500/10 text-blue-500",
      actionText: "New Booking"
    },
    {
      title: "My Bookings",
      description: "View status and history of your reservations.",
      icon: User,
      color: "bg-purple-500/10 text-purple-500",
      actionText: "Manage Bookings"
    },
    {
      title: "Invoices & Payments",
      description: "Review receipts, bills, and transaction details.",
      icon: CreditCard,
      color: "bg-emerald-500/10 text-emerald-500",
      actionText: "View Receipts"
    },
    {
      title: "Support Desk",
      description: "Need help? Open a request with our front desk.",
      icon: HelpCircle,
      color: "bg-amber-500/10 text-amber-500",
      actionText: "Get Support"
    }
  ]

  const hotelServices = [
    { name: "Complimentary Wi-Fi", value: "SSID: Sunrise_Guest | Pass: Welcome2026", icon: Wifi },
    { name: "Main Restaurant", value: "Breakfast: 7:00 AM - 10:30 AM | Dinner: 7:00 PM - 10:00 PM", icon: UtensilsCrossed },
    { name: "Rooftop Pool & Spa", value: "Open Daily: 8:00 AM - 9:00 PM", icon: Waves }
  ]

  return (
    <BaseLayout 
      role="client"
      title={`Welcome back, ${firstName}!`}
      description="Manage your hotel experience, room bookings, and guest requests."
    >
      <div className="px-4 lg:px-6 space-y-6 @container/main">
        {/* Welcome Promo Section */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Loyalty Member Status
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Enjoy 15% off room service on your current stay!</h2>
              <p className="text-muted-foreground text-sm">Use your mobile order feature or inform the waitstaff of your digital booking key at checkout.</p>
            </div>
            <Button size="lg" className="shrink-0 hover:scale-[1.02] transition-transform">
              Book Special Package
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
          <div className="absolute top-1/2 right-0 -z-0 size-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-semibold tracking-tight mb-4">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, i) => (
              <div 
                key={i} 
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="space-y-4">
                  <div className={`inline-flex rounded-lg p-2.5 ${action.color}`}>
                    <action.icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{action.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t flex items-center justify-between text-xs font-semibold text-primary">
                  <span>{action.actionText}</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details and Info Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Active Booking Summary */}
          <div className="md:col-span-2 rounded-xl border bg-card p-5">
            <h3 className="text-base font-semibold mb-4">Active & Upcoming Reservations</h3>
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg min-h-[180px] bg-muted/5">
              <Calendar className="size-8 text-muted-foreground mb-3 opacity-60" />
              <p className="text-muted-foreground text-sm font-medium">No active or upcoming bookings found.</p>
              <p className="text-xs text-muted-foreground mt-1">When you book your next stay, details will appear here.</p>
              <Button variant="outline" size="sm" className="mt-4">
                Make a Reservation
              </Button>
            </div>
          </div>

          {/* Hotel Guest Information */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-base font-semibold">Guest Directory Info</h3>
            <div className="space-y-4">
              {hotelServices.map((service, i) => (
                <div key={i} className="flex gap-3 items-start text-sm">
                  <div className="rounded bg-muted p-2 mt-0.5 text-muted-foreground">
                    <service.icon className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{service.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
