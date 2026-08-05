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
      <div className="bg-primary text-primary-foreground text-[9.5px] sm:text-[10px] font-bold tracking-[0.18em] sm:tracking-[0.25em] uppercase py-1.5 sm:py-2 px-3 text-center flex items-center justify-center gap-1.5 sm:gap-2 leading-none whitespace-nowrap overflow-hidden">
        <Sparkles className="size-3 fill-current opacity-80 shrink-0" />
        <span className="truncate">
          Forbes 5-Star Sanctuary 2026<span className="hidden sm:inline"> • Complimentary Private Helipad Transfers Included</span>
        </span>
        <Sparkles className="size-3 fill-current opacity-80 shrink-0 hidden sm:inline" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 xl:gap-6">

        {/* Dedicated Resort Luxury Logo */}
        <Link to="/" className="shrink-0">
          <LandingLogo variant="auto" />
        </Link>

        {/* Clean Luxury Nav Links */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 text-[10.5px] xl:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.14em] xl:tracking-[0.18em] whitespace-nowrap">
          <a href="#about" className="hover:text-primary transition-colors py-1 whitespace-nowrap">The Resort</a>
          <a href="#suites" className="hover:text-primary transition-colors py-1 whitespace-nowrap">Suites & Villas</a>
          <a href="#packages" className="hover:text-primary transition-colors py-1 flex items-center gap-1.5 text-primary font-bold whitespace-nowrap">
            <span>Offers</span>
            <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
          </a>
          <a href="#experiences" className="hover:text-primary transition-colors py-1 whitespace-nowrap">Dining & Spa</a>
          <a href="#reviews" className="hover:text-primary transition-colors py-1 whitespace-nowrap">Reviews</a>
          <a href="#contact" className="hover:text-primary transition-colors py-1 whitespace-nowrap">Contact</a>
        </nav>

        {/* Guest Hotline, Account & Primary Reservation CTA */}
        <div className="hidden sm:flex items-center gap-3 xl:gap-5 shrink-0">
          {/* Phone Hotline Badge */}
          <a
            href="tel:18005557867"
            className="hidden 2xl:inline-flex items-center gap-2 text-[10.5px] xl:text-[11px] font-semibold tracking-wider text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            <Phone className="size-3.5 text-primary" />
            <span>+1 (800) 555-7867</span>
          </a>

          <div className="h-4 w-px bg-border hidden 2xl:block" />

          <Link to="/auth/sign-in" className="whitespace-nowrap">
            <span className="text-[10.5px] xl:text-[11px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
              Guest Sign In
            </span>
          </Link>

          <Link to="/guest/bookings" className="shrink-0">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] xl:text-[11px] tracking-[0.15em] xl:tracking-[0.2em] uppercase h-9 xl:h-10 px-4 xl:px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer gap-2 whitespace-nowrap shrink-0"
            >
              <Calendar className="size-3.5 shrink-0" />
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
