"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LandingLogo } from "@/components/landing-logo"
import { Menu, X, Calendar, Phone, Sparkles } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 text-foreground backdrop-blur-2xl transition-colors shadow-lg font-sans">
      {/* Top Luxury Announcement Ticker Bar */}
      <div className="bg-primary text-primary-foreground text-[10px] font-medium tracking-[0.25em] uppercase py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="size-3 fill-current opacity-80" />
        <span>Forbes 5-Star Sanctuary 2026 • Complimentary Private Helipad Transfers Included</span>
        <Sparkles className="size-3 fill-current opacity-80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">

        {/* Dedicated Resort Luxury Logo */}
        <Link to="/" className="shrink-0">
          <LandingLogo variant="auto" />
        </Link>

        {/* Clean Luxury Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          <a href="#about" className="hover:text-primary transition-colors py-1">The Resort</a>
          <a href="#suites" className="hover:text-primary transition-colors py-1">Suites & Villas</a>
          <a href="#packages" className="hover:text-primary transition-colors py-1 flex items-center gap-1.5 text-primary font-bold">
            <span>Offers</span>
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          </a>
          <a href="#experiences" className="hover:text-primary transition-colors py-1">Dining & Spa</a>
          <a href="#reviews" className="hover:text-primary transition-colors py-1">Reviews</a>
          <a href="#contact" className="hover:text-primary transition-colors py-1">Contact</a>
        </nav>

        {/* Guest Hotline, Account & Primary Reservation CTA */}
        <div className="hidden sm:flex items-center gap-5 shrink-0">
          {/* Phone Hotline Badge */}
          <a
            href="tel:18005557867"
            className="hidden xl:inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            <Phone className="size-3.5 text-primary" />
            <span>+1 (800) 555-7867</span>
          </a>

          <div className="h-4 w-px bg-border hidden xl:block" />

          <Link to="/auth/sign-in">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Guest Sign In
            </span>
          </Link>

          <Link to="/guest/bookings">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] tracking-[0.2em] uppercase h-10 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer gap-2"
            >
              <Calendar className="size-3.5" />
              <span>Book A Stay</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden size-10 text-foreground cursor-pointer hover:bg-muted"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border/80 bg-background/98 backdrop-blur-2xl px-6 py-6 space-y-4 text-xs font-bold text-foreground">
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-primary uppercase tracking-widest">The Resort</a>
          <a href="#suites" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-primary uppercase tracking-widest">Suites & Villas</a>
          <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-primary font-extrabold uppercase tracking-widest">Exclusive Offers</a>
          <a href="#experiences" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-primary uppercase tracking-widest">Dining & Spa</a>
          <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-primary uppercase tracking-widest">Guest Reviews</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-primary uppercase tracking-widest">Contact Concierge</a>

          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <Link to="/guest/bookings" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full text-xs font-black tracking-widest uppercase justify-center gap-2 bg-primary text-primary-foreground h-11 rounded-full">
                <Calendar className="size-4" />
                Book A Stay
              </Button>
            </Link>
            <Link to="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-xs font-bold tracking-widest uppercase justify-center h-10 rounded-full border-border text-foreground">
                Guest Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
