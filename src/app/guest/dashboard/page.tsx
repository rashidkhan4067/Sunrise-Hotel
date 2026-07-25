"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { fetchGuests } from "@/features/guests/api"
import { fetchBookings } from "@/features/bookings/api"
import { ActiveStayCard } from "./components/active-stay-card"
import { GuestDirectory } from "./components/guest-directory"
import { GuestQuickActions } from "./components/guest-quick-actions"
import { Joyride } from "react-joyride"
import { ProfileCompletionDialog } from "./components/profile-completion-dialog"
import { HelpCircle } from "lucide-react"
import { CtaBanner } from "@/components/shared"

const STATUS = { FINISHED: "finished", SKIPPED: "skipped" }
type CallBackProps = any

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
  const [guestInfo, setGuestInfo] = useState<any>(null)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  const [runTour, setRunTour] = useState(false)

  const tourSteps = [
    {
      target: "#tour-welcome",
      content: "Welcome to your Guest Portal! Here you can check your Platinum status, get details on active stays, and access room services.",
      disableBeacon: true,
    },
    {
      target: "#tour-active-stay",
      content: "This panel shows your current check-in status, dates of stay, and room details. Keep an eye here for updates from hotel staff!",
    },
    {
      target: "#tour-directory",
      content: "Need to know wifi details, pool timings, or contact reception? Use the Guest Directory to find all essential hotel services.",
    },
    {
      target: "#tour-quick-actions",
      content: "Quickly request housekeeping, call room service, or download your invoices directly using these quick action cards.",
    },
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem("guest_onboarding_completed", "true")
      setRunTour(false)
    }
  }

  const handleProfileComplete = (updatedGuest: any) => {
    setGuestInfo(updatedGuest)
    setShowProfileCompletion(false)
  }

  useEffect(() => {
    let active = true
    let intervalId: any = null

    async function loadActiveStayAndProfile(isInitial = false) {
      if (isInitial) {
        setLoading(true)
      }
      try {
        const token = await getToken()
        if (!token) return
        
        // 1. Fetch guest profile to check completeness
        const guestList = await fetchGuests(token)
        
        if (active && guestList.length > 0) {
          const profile = guestList[0]
          setGuestInfo(profile)
          
          const isProfileIncomplete = 
            !profile.document_number || 
            profile.document_number === "PENDING" || 
            !profile.phone_number || 
            !profile.address
            
          if (isProfileIncomplete && isInitial) {
            setShowProfileCompletion(true)
          }
        }

        // 2. Fetch booking stay details
        const bookings = await fetchBookings(token)
        const bookingsList = Array.isArray(bookings) ? bookings : ((bookings as any).results || [])
        
        const stay = bookingsList.find((b: any) => 
          ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status)
        )
        if (active) {
          setActiveStay(stay || null)
        }
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        if (active && isInitial) {
          setLoading(false)
        }
      }
    }

    loadActiveStayAndProfile(true)

    // Poll every 5 seconds for real-time guest updates
    intervalId = setInterval(() => {
      loadActiveStayAndProfile(false)
    }, 5000)

    return () => {
      active = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [getToken])

  return (
    <BaseLayout 
      role="guest"
      title={`Welcome back, ${firstName}!`}
      description="Manage your stay, room services, and billing invoices."
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setRunTour(true)}
          className="cursor-pointer gap-1.5 font-semibold text-xs animate-pulse bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
        >
          <HelpCircle className="size-3.5" />
          Start Tour
        </Button>
      }
    >
      <div className="px-4 lg:px-6 space-y-6 @container/main">
        {/* Dynamic Guest CTA Banner */}
        <div id="tour-welcome">
          <CtaBanner
            id="guest-upgrade-banner"
            variant="promo"
            badgeText="Loyalty Status: Platinum Guest"
            title="Enjoy 15% off room service on your current stay!"
            description="Present your booking ID or room number to waitstaff, or mention it when calling room service."
            actionLabel="Book Another Stay"
            onAction={() => navigate("/guest/bookings?action=new")}
          />
        </div>

        {/* Stay Summary Panel */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div id="tour-active-stay" className="lg:col-span-2">
            <ActiveStayCard 
              activeStay={activeStay} 
              loading={loading} 
              onBookClick={() => navigate("/guest/bookings?action=new")} 
            />
          </div>
          <div id="tour-directory">
            <GuestDirectory />
          </div>
        </div>

        {/* Quick Actions */}
        <div id="tour-quick-actions">
          <GuestQuickActions />
        </div>

        <ProfileCompletionDialog
          open={showProfileCompletion}
          guestId={guestInfo?.id}
          getToken={getToken}
          onComplete={handleProfileComplete}
        />
        {/* Tour component */}
        {(() => {
          const JoyComponent = Joyride as any
          return (
            <JoyComponent
              steps={tourSteps}
              run={runTour}
              continuous
              showSkipButton
              showProgress
              callback={handleJoyrideCallback}
              styles={{
                options: {
                  primaryColor: "hsl(var(--primary))",
                  textColor: "hsl(var(--foreground))",
                  backgroundColor: "hsl(var(--card))",
                  arrowColor: "hsl(var(--card))",
                },
                tooltipContainer: {
                  textAlign: "left",
                  borderRadius: "12px",
                },
                buttonNext: {
                  borderRadius: "6px",
                  fontWeight: "bold",
                },
                buttonBack: {
                  marginRight: "10px",
                  fontWeight: "bold",
                },
              } as any}
            />
          )
        })()}
      </div>
    </BaseLayout>
  )
}
