import React from "react"
import { Link } from "react-router-dom"
import { LandingLogo } from "@/components/landing-logo"
import { Star, Award, ShieldCheck, ArrowLeft } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

// Curated luxury resort photography from Unsplash — matches landing page hero shots
const RESORT_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop",
    caption: "Oceanfront Infinity Pool Sanctuary",
    sub: "Forbes 5-Star Private Luxury Resort & Spa",
  },
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920&auto=format&fit=crop",
    caption: "Presidential Ocean Suite",
    sub: "Butler Service · Private Jacuzzi · Sea View",
  },
  {
    url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1920&auto=format&fit=crop",
    caption: "Michelin Dining Experience",
    sub: "4 Award-Winning Restaurants On-Site",
  },
]

const ACTIVE_SLIDE = RESORT_SLIDES[0]

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-2 font-sans bg-background text-foreground">

      {/* ── Left Panel: Auth Form ───────────────────────────────────────────── */}
      <div className="flex flex-col min-h-svh bg-background text-foreground transition-colors">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-20 gap-2">
          <Link to="/" className="hover:opacity-85 transition-opacity shrink-0">
            <LandingLogo variant="auto" iconSize={22} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">Back to Resort</span>
            <span className="sm:hidden">Resort</span>
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-14">
          <div className="w-full max-w-md space-y-1">
            {children}
            <div id="clerk-captcha" className="mt-4" />
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="px-4 sm:px-6 py-4 border-t border-border/60">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Award className="size-3.5 text-primary" />
              Forbes 5-Star 2026
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5">
              <Star className="size-3.5 fill-primary text-primary" />
              Michelin Key Winner
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              256-bit SSL
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Clean Luxury Resort Image ─────────────────────────────── */}
      <div className="relative hidden lg:block overflow-hidden bg-zinc-950 border-l border-border/40">
        {/* Full-bleed resort background image */}
        <img
          src={ACTIVE_SLIDE.url}
          alt={ACTIVE_SLIDE.caption}
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        />

        {/* Subtle Luxury Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

    </div>
  )
}
