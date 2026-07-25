"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, Check, Gift, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const packages = [
  {
    id: "romantic-escape",
    tag: "Most Requested Couple's Escape",
    title: "Honeymoon & Coastal Serenity",
    duration: "4 Days / 3 Nights",
    originalPrice: 1850,
    discountedPrice: 1490,
    savings: "Save $360",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    features: [
      "Executive Ocean Suite Stay with Heated Balcony Jacuzzi",
      "Private Sunset Champagne Dinner on the Beach",
      "Couple's Aromatherapy Massage (90 Mins)",
      "Daily Gourmet Breakfast Served in Suite",
      "Complimentary VIP Airport Transfer"
    ],
    highlight: "Includes Private Beach Dinner"
  },
  {
    id: "wellness-detox",
    tag: "Holistic Sanctuary",
    title: "7-Day Thermal Spa & Detox Retreat",
    duration: "7 Days / 6 Nights",
    originalPrice: 3200,
    discountedPrice: 2650,
    savings: "Save $550",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    features: [
      "Private Spa Villa Accommodations",
      "Unlimited Access to Hydrotherapy Pools & Saunas",
      "Custom Organic Nutrition & Juice Cleansing Plan",
      "Daily Sunrise Beach Yoga & Meditation Classes",
      "Personal Wellness Coach & Therapist Consultations"
    ],
    highlight: "All-Inclusive Wellness & Spa"
  },
  {
    id: "yacht-gourmet",
    tag: "VIP Exclusive Experience",
    title: "Gourmet Dining & Private Yacht Week",
    duration: "5 Days / 4 Nights",
    originalPrice: 4500,
    discountedPrice: 3800,
    savings: "Save $700",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80",
    features: [
      "Presidential Oceanfront Villa Accommodations",
      "Full-Day Private Yacht Expedition & Snorkeling",
      "Chef's Tasting Menu at 4 Michelin-Star Restaurants",
      "24/7 Dedicated Personal Butler & Chauffeur",
      "Private Helipad Airport Transfer Service"
    ],
    highlight: "Includes Private Yacht Expedition"
  }
]

export function PackagesSection() {
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [preferredDate, setPreferredDate] = useState("2026-09-01")

  function handleReserveSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPackage || !guestName || !guestEmail) return
    toast.success(`Package "${selectedPackage.title}" requested! Our VIP concierge will contact you at ${guestEmail}.`)
    setSelectedPackage(null)
  }

  return (
    <section id="packages" className="py-24 bg-background border-b border-border/60 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <Badge variant="outline" className="text-[11px] font-black tracking-[0.25em] uppercase px-4 py-1.5 border-primary/40 text-primary bg-primary/10 rounded-full">
            Curated Resort Packages
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-foreground tracking-tight font-normal leading-tight">
            Exclusive Seasonal Offers & Bespoke Getaways
          </h2>
          <p className="text-base text-muted-foreground font-sans font-normal leading-relaxed max-w-2xl mx-auto">
            Indulge in all-inclusive luxury getaways combining suite accommodations, Michelin dining, thermal spa rituals, and private yacht charters.
          </p>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 flex flex-col justify-between group relative"
            >
              {/* Top Savings Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Gift className="size-3.5" />
                  {pkg.savings}
                </span>
              </div>

              {/* Package Header Image */}
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-black/30" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-border/60 shadow-sm">
                    {pkg.tag}
                  </span>
                </div>
              </div>

              {/* Package Body */}
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                      {pkg.title}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" />
                      <span>{pkg.duration}</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-extrabold">{pkg.highlight}</span>
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 pt-2 border-t border-border/50">
                    <span className="text-3xl font-serif font-bold text-foreground">${pkg.discountedPrice}</span>
                    <span className="text-xs font-semibold text-muted-foreground line-through">${pkg.originalPrice}</span>
                    <span className="text-[11px] text-muted-foreground">/ package</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-1">
                    {pkg.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-3.5 text-primary shrink-0 mt-0.5 stroke-[3]" />
                        <span className="text-foreground font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reservation Action Button */}
                <Button
                  onClick={() => setSelectedPackage(pkg)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest h-11 rounded-2xl shadow-md hover:scale-[1.02] transition-all cursor-pointer gap-2"
                >
                  <span>Reserve Package</span>
                  <ArrowRight className="size-4 stroke-[3]" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Reservation Dialog Modal */}
      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="max-w-md bg-card border-border sm:rounded-3xl p-6 text-card-foreground">
            <DialogHeader className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="size-4" />
                <span>Bespoke Package Reservation</span>
              </div>
              <DialogTitle className="text-2xl font-serif font-bold text-foreground">
                {selectedPackage.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedPackage.duration} • <span className="text-emerald-500 font-bold">${selectedPackage.discountedPrice} Total</span> ({selectedPackage.savings})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReserveSubmit} className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Guest Full Name</label>
                <Input
                  placeholder="e.g. Rashid Khan"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="h-10 bg-muted/20 border-border text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="rashid@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className="h-10 bg-muted/20 border-border text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Preferred Arrival Date</label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                  className="h-10 bg-muted/20 border-border text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest h-11 rounded-2xl cursor-pointer shadow-md mt-2"
              >
                Confirm Bespoke Reservation Inquiry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}
