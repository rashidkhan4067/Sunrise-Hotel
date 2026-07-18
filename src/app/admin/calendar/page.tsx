"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { HotelCalendar } from "./components/hotel-calendar"

export default function CalendarPage() {
  return (
    <BaseLayout
      title="Booking Calendar"
      description="Live view of guest check-ins and check-outs across all rooms."
    >
      <div className="px-4 lg:px-6">
        <HotelCalendar />
      </div>
    </BaseLayout>
  )
}
