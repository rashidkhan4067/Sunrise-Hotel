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
    <footer className="bg-background text-foreground border-t border-border/80 pt-16 pb-12 relative overflow-hidden font-sans transition-colors">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 size-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* VIP Privilege Newsletter Signup Bar */}
        <div className="p-8 sm:p-10 rounded-3xl bg-card border border-primary/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <span className="text-[10px] font-black tracking-[0.25em] text-primary uppercase">
              Exclusive Guest Privileges
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-foreground font-normal">
              Subscribe to SunRise VIP Invitations
            </h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Receive private advance booking access, complimentary spa credits, and seasonal villa offer invitations directly to your inbox.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-5 py-3 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="size-4" />
              <span>VIP Privilege Invitation Dispatched!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="pl-10 h-12 w-full sm:w-72 bg-muted/20 border-border text-foreground text-xs rounded-2xl focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs tracking-widest uppercase h-12 px-6 rounded-2xl cursor-pointer shadow-lg hover:scale-105 transition-all gap-2"
              >
                <span>Subscribe</span>
                <ArrowRight className="size-4 stroke-[3]" />
              </Button>
            </form>
          )}
        </div>

        {/* Main Footer 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pt-4">
          
          {/* Column 1: Brand & Direct Coordinates (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <LandingLogo variant="auto" />
            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-sm">
              Overlooking private turquoise ocean waters, SunRise Hotel & Spa merges five-star luxury accommodations, Michelin dining, and 24/7 personal butler service.
            </p>
            <div className="space-y-2.5 text-xs text-foreground font-semibold pt-1">
              <p className="flex items-center gap-2.5">
                <MapPin className="size-4 text-primary shrink-0" />
                <span>100 SunRise Resort Blvd, Oceanfront Coastline</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 text-primary shrink-0" />
                <span>+1 (800) 555-7867 (24/7 VIP Concierge)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 text-primary shrink-0" />
                <span>concierge@sunrisehotel.com</span>
              </p>
            </div>
          </div>

          {/* Column 2: Suites & Accommodations (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Accommodations</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li><a href="#suites" className="hover:text-foreground transition-colors">Deluxe King Suites</a></li>
              <li><a href="#suites" className="hover:text-foreground transition-colors">Executive Ocean Suites (Jacuzzi)</a></li>
              <li><a href="#suites" className="hover:text-foreground transition-colors">Presidential Oceanfront Villa</a></li>
              <li><a href="#suites" className="hover:text-foreground transition-colors">Private Haven Villas</a></li>
              <li><a href="#suites" className="hover:text-foreground transition-colors">In-Room Dining & Amenities</a></li>
            </ul>
          </div>

          {/* Column 3: Resort Experiences (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Experiences</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Michelin Fine Dining Restaurants</a></li>
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Thermal Hydrotherapy Spa</a></li>
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Private Motor Yacht Charters</a></li>
              <li><a href="#experiences" className="hover:text-foreground transition-colors">Oceanfront Infinity Pools</a></li>
              <li><a href="#packages" className="hover:text-primary transition-colors text-primary font-bold">Curated Seasonal Offers</a></li>
            </ul>
          </div>

          {/* Column 4: Guest Services & Access (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Guest Access</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li><Link to="/guest/bookings" className="hover:text-primary transition-colors text-primary font-bold">Book A Stay</Link></li>
              <li><Link to="/auth/sign-in" className="hover:text-foreground transition-colors">Guest Portal Login</Link></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Direct Concierge Inquiry</a></li>
              <li><a href="#reviews" className="hover:text-foreground transition-colors">Guest Reviews & Ratings</a></li>
            </ul>
          </div>
        </div>

        {/* Awards Recognition Ribbon */}
        <div className="pt-8 border-t border-border/60 flex flex-wrap items-center justify-between gap-6 text-xs font-bold text-muted-foreground">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-2">
              <Award className="size-4 text-primary" />
              <span>Forbes 5-Star Travel Guide 2026</span>
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-2">
              <Star className="size-4 fill-primary text-primary" />
              <span>Michelin Key Award Winner</span>
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>100% Carbon Neutral Eco Luxury</span>
            </span>
          </div>

          <span className="text-[11px] text-muted-foreground font-medium">
            Designed for World-Class Hospitality
          </span>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-medium">
          <p>© 2026 SunRise Hotels & Resorts. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#about" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#about" className="hover:text-zinc-300 transition-colors">Cookie Preferences</a>
            <Link to="/admin/dashboard" className="hover:text-foreground transition-colors text-muted-foreground">Staff Admin</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
