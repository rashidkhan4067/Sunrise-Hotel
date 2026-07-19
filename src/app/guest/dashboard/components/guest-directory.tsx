"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, Wifi, UtensilsCrossed, Waves } from "lucide-react"

export function GuestDirectory() {
  const hotelServices = [
    { name: "Complimentary Wi-Fi", value: "SSID: Sunrise_Guest | Pass: Welcome2026", icon: Wifi },
    { name: "Main Dining & Buffet", value: "Breakfast: 7:00 AM - 10:30 AM | Dinner: 7:00 PM - 10:00 PM", icon: UtensilsCrossed },
    { name: "Rooftop Pool & Spa", value: "Open Daily: 8:00 AM - 9:00 PM | Floor 6", icon: Waves }
  ]

  return (
    <Card className="border-border/80 shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          Guest Directory
        </CardTitle>
        <CardDescription className="text-xs">Hotel services and connectivity information</CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {hotelServices.map((service, i) => (
          <div key={i} className="flex gap-3 items-start text-xs hover:-translate-x-0.5 transition-transform duration-200">
            <div className="rounded-lg bg-muted p-2 mt-0.5 text-primary border border-border/40 shrink-0 shadow-3xs">
              <service.icon className="size-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="font-semibold text-foreground">{service.name}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed truncate-2-lines">{service.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
