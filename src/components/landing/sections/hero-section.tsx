"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Calendar, Users, Bed, Search, Sparkles, Award, ShieldCheck, ArrowRight } from "lucide-react"

const suiteRates: Record<string, { name: string; price: number }> = {
  DELUXE: { name: "Deluxe King Suite", price: 180 },
  SUITE: { name: "Executive Ocean Suite", price: 350 },
  PENTHOUSE: { name: "Presidential Villa", price: 750 },
}

export function HeroSection() {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState("2026-08-01")
  const [checkOut, setCheckOut] = useState("2026-08-05")
  const [guests, setGuests] = useState("2")
  const [roomType, setRoomType] = useState("SUITE")

  // Calculate stay duration & estimate cost
  const estimatedCost = useMemo(() => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.max(1000 * 60 * 60 * 24, end.getTime() - start.getTime())
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const basePrice = suiteRates[roomType]?.price || 350
    return {
      nights,
      total: nights * basePrice,
      perNight: basePrice
    }
  }, [checkIn, checkOut, roomType])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/guest/bookings?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&room=${roomType}`)
  }

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-zinc-950 text-white font-sans">
      {/* Immersive Oceanfront Resort Background Image - Always Visible with Dark Luxury Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=95"
          alt="SunRise Oceanfront Luxury Resort & Sunset Pool View"
          className="w-full h-full object-cover object-center scale-105 opacity-70 transition-transform duration-1000"
        />
        {/* Cinematic Vignette & Dark Overlay ensuring image visibility across all themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/75" />
        <div className="absolute inset-0 bg-radial from-transparent via-zinc-950/40 to-zinc-950/90 pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center space-y-10 relative z-10">

        {/* Five-Star Resort Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase shadow-2xl backdrop-blur-xl">
          <Star className="size-3.5 fill-primary text-primary" />
          <span>Forbes Travel Guide 5-Star Sanctuary 2026</span>
          <Award className="size-3.5 text-primary" />
        </div>

        {/* High-Contrast Luxury Typography */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white font-normal leading-[1.1] tracking-tight">
            Where Oceanfront Luxury Meets{" "}
            <span className="italic font-serif text-primary font-normal underline decoration-primary/40 underline-offset-8">
              Five-Star Serenity
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-sans font-normal leading-relaxed">
            Overlooking private turquoise beaches, SunRise Hotel invites you to indulge in oceanfront suites, Michelin-grade dining, and 24/7 personal butler concierge support.
          </p>
        </div>

        {/* Location Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-zinc-300 bg-black/50 px-4 py-2 rounded-full border border-white/15 backdrop-blur-md">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span>100 SunRise Resort Boulevard, Oceanfront Coastline</span>
          <span className="text-zinc-600">•</span>
          <span className="text-primary font-bold">Pristine Private Beach</span>
        </div>

        {/* Floating Glassmorphic Booking Engine */}
        <div className="max-w-5xl mx-auto pt-4">
          <form
            onSubmit={handleSearch}
            className="p-5 sm:p-7 rounded-3xl border border-white/20 bg-zinc-950/85 shadow-2xl space-y-5 text-left backdrop-blur-2xl text-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Check-In Date
                </label>
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="text-xs h-11 bg-white/10 border-white/20 text-white font-bold focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Check-Out Date
                </label>
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="text-xs h-11 bg-white/10 border-white/20 text-white font-bold focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" /> Guests
                </label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="text-xs h-11 bg-white/10 border-white/20 text-white font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4+ Family Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
                  <Bed className="size-3.5 text-primary" /> Suite Category
                </label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="text-xs h-11 bg-white/10 border-white/20 text-white font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="DELUXE">Deluxe King Suite ($180/n)</SelectItem>
                    <SelectItem value="SUITE">Executive Ocean Suite ($350/n)</SelectItem>
                    <SelectItem value="PENTHOUSE">Presidential Villa ($750/n)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Live Rate Calculation Bar & Primary Reservation Action Button */}
            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-2.5 rounded-2xl bg-primary/15 text-primary border border-primary/30">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 block">
                    Estimated Stay Total
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    ${estimatedCost.total}{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      ({estimatedCost.nights} {estimatedCost.nights === 1 ? "Night" : "Nights"} @ ${estimatedCost.perNight}/n)
                    </span>
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs tracking-widest uppercase h-12 px-7 rounded-2xl w-full sm:w-auto shadow-xl hover:scale-105 transition-all cursor-pointer gap-2"
              >
                <Search className="size-4 stroke-[3]" />
                <span>Check Availability • ${estimatedCost.total}</span>
                <ArrowRight className="size-4 stroke-[3]" />
              </Button>
            </div>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Private Infinity Pools</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Certified Clean & Sanitized</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Star className="size-4 text-primary fill-primary" />
            <span>24/7 Personal Butler Concierge</span>
          </div>
        </div>
      </div>
    </section>
  )
}
