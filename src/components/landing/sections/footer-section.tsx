"use client"

import { useState } from "react"
import { LandingLogo } from "@/components/landing-logo"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Award, Star, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function FooterSection() {
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!newsletterEmail) return
    setSubscribed(true)
    toast.success("Welcome to SunRise VIP Privileges! Your invitation details have been sent.")
  }

  return (
    <footer className="bg-background text-foreground border-t border-border/80 pt-10 md:pt-16 pb-8 md:pb-12 relative overflow-hidden font-sans transition-colors">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 size-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-16 relative z-10">
        
        {/* VIP Privilege Newsletter Signup Bar */}
        <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-card border border-primary/30 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl text-center lg:text-left">
            <span className="text-[9.5px] sm:text-[10px] font-black tracking-[0.25em] text-primary uppercase">
              Exclusive Guest Privileges
            </span>
            <h3 className="text-xl sm:text-3xl font-serif text-foreground font-normal">
              Subscribe to SunRise VIP Invitations
            </h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed hidden sm:block">
              Receive private advance booking access, complimentary spa credits, and seasonal villa offer invitations directly to your inbox.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-4 py-2.5 rounded-xl sm:rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="size-4" />
              <span>VIP Privilege Invitation Dispatched!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full lg:w-auto">
              <div className="relative w-full">
                <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="pl-10 h-10 sm:h-12 w-full sm:w-72 bg-muted/20 border-border text-foreground text-xs rounded-xl sm:rounded-2xl focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs tracking-widest uppercase h-10 sm:h-12 px-6 rounded-xl sm:rounded-2xl cursor-pointer shadow-md hover:scale-105 transition-all gap-2"
              >
                <span>Subscribe</span>
                <ArrowRight className="size-4 stroke-[3]" />
              </Button>
            </form>
          )}
        </div>

        {/* Main Footer Minimal Responsive Layout */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10 pt-2 sm:pt-4">
          
          {/* Column 1: Brand & Direct Coordinates (Spans full width on mobile) */}
          <div className="col-span-2 lg:col-span-4 space-y-3.5 sm:space-y-5">
            <LandingLogo variant="auto" />
            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-sm hidden sm:block">
              Overlooking private turquoise ocean waters, SunRise Hotel & Spa merges five-star luxury accommodations, Michelin dining, and 24/7 personal butler service.
            </p>
            <div className="space-y-2 text-xs text-foreground font-semibold pt-1">
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 sm:size-4 text-primary shrink-0" />
                <span>100 SunRise Resort Blvd, Oceanfront</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-3.5 sm:size-4 text-primary shrink-0" />
                <span>+1 (800) 555-7867 (24/7 VIP Concierge)</span>
              </p>
            </div>
          </div>

          {/* Column 2: Accommodations */}
          <div className="col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-primary">Accommodations</h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li><a href="#suites" className="hover:text-foreground transition-colors">Deluxe King Suites</a></li>
              <li><a href="#suites" className="hover:text-foreground transition-colors">Executive Ocean Suites</a></li>
              <li><a href="#suites" className="hover:text-foreground transition-colors">Oceanfront Villas</a></li>
              <li className="hidden sm:block"><a href="#suites" className="hover:text-foreground transition-colors">Private Haven Villas</a></li>
            </ul>
          </div>

          {/* Column 3: Resort Experiences */}
          <div className="col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-primary">Experiences</h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Fine Dining</a></li>
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Hydrotherapy Spa</a></li>
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Motor Yacht Charters</a></li>
              <li className="hidden sm:block"><a href="#packages" className="hover:text-primary transition-colors text-primary font-bold">Curated Offers</a></li>
            </ul>
          </div>

          {/* Column 4: Guest Access */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 space-y-3 sm:space-y-4 pt-3 sm:pt-0 border-t sm:border-0 border-border/40">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-primary">Guest Access</h4>
            <ul className="flex flex-row sm:flex-col flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
              <li><Link to="/guest/bookings" className="hover:text-primary transition-colors text-primary font-bold">Book A Stay</Link></li>
              <li><Link to="/auth/sign-in" className="hover:text-foreground transition-colors">Portal Login</Link></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Concierge</a></li>
            </ul>
          </div>
        </div>

        {/* Awards Recognition Ribbon */}
        <div className="pt-6 sm:pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5">
              <Award className="size-3.5 text-primary" />
              <span>Forbes 5-Star 2026</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Star className="size-3.5 fill-primary text-primary" />
              <span>Michelin Key Winner</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>100% Eco Luxury</span>
            </span>
          </div>

          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium hidden md:inline">
            Designed for World-Class Hospitality
          </span>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-4 sm:pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] text-muted-foreground font-medium text-center sm:text-left">
          <p>© 2026 SunRise Hotels & Resorts. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#about" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#about" className="hover:text-foreground transition-colors">Terms of Service</a>
            <Link to="/admin/dashboard" className="hover:text-foreground transition-colors text-muted-foreground font-bold">Staff Admin</Link>
          </div>
        </div>

      </div>
    </footer>

  )
}
