"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { ActiveStayCard } from "./components/active-stay-card"
import { GuestDirectory } from "./components/guest-directory"
import { GuestQuickActions } from "./components/guest-quick-actions"

interface GuestStay {
  booking_id: string
  room_details?: {
    room_number: string
    room_type: string
  }
  check_in: string
  check_out: string
  status: string
  total_price: string | number
  adults: number
  children: number
}

export default function GuestDashboardPage() {
  const { user, getToken } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.firstName || "Guest"

  const [activeStay, setActiveStay] = useState<GuestStay | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActiveStay() {
      try {
        const token = await getToken()
        if (!token) return
        const bookings = await apiClient.get<any>("/bookings/", token)
        const bookingsList = Array.isArray(bookings) ? bookings : (bookings.results || [])
        
        // Find the first active/upcoming booking (PENDING, CONFIRMED, or CHECKED_IN)
        const stay = bookingsList.find((b: any) => 
          ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status)
        )
        if (stay) {
          setActiveStay(stay)
        }
      } catch (err: any) {
        console.error("Failed to load guest stays:", err)
      } finally {
        setLoading(false)
      }
    }
    loadActiveStay()
  }, [getToken])

  return (
    <BaseLayout 
      role="guest"
      title={`Welcome back, ${firstName}!`}
      description="Manage your stay, room services, and billing invoices."
    >
      <div className="px-4 lg:px-6 space-y-6 @container/main">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="size-3.5" />
                Loyalty Status: Platinum Guest
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Enjoy 15% off room service on your current stay!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">Present your booking ID or room number to waitstaff, or mention it when calling room service.</p>
            </div>
            <Button size="lg" className="shrink-0 hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer font-semibold" onClick={() => navigate("/guest/bookings?action=new")}>
              Book Another Stay
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
          <div className="absolute top-1/2 right-0 -z-0 size-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Stay Summary Panel */}
        <div className="grid gap-6 md:grid-cols-3">
          <ActiveStayCard 
            activeStay={activeStay} 
            loading={loading} 
            onBookClick={() => navigate("/guest/bookings?action=new")} 
          />
          <GuestDirectory />
        </div>

        {/* Quick Actions */}
        <GuestQuickActions />
      </div>
    </BaseLayout>
  )
}
