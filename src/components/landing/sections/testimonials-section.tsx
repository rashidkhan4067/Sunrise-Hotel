"use client"

import { useState } from "react"
import { Star, Quote, BadgeCheck, Award, ShieldCheck } from "lucide-react"

const reviews = [
  {
    id: "rev-1",
    category: "COUPLE",
    name: "Victoria Sterling",
    role: "Executive Ocean Suite Guest",
    comment: "Our stay at SunRise Hotel was absolute perfection. The private balcony Jacuzzi view was breathtaking, and requesting extra towels via the guest chat with instant staff replies made our stay effortless!",
    rating: 5,
    award: "Verified Stay 2026"
  },
  {
    id: "rev-2",
    category: "FAMILY",
    name: "Marcus Vance",
    role: "Presidential Villa Guest",
    comment: "The private oceanfront infinity pool and 24/7 personal butler service exceeded all our expectations. Check-out was smooth with crystal clear digital invoices on my phone.",
    rating: 5,
    award: "VIP Villa Guest"
  },
  {
    id: "rev-3",
    category: "SPA",
    name: "Elena & David Rostova",
    role: "Deluxe King Suite Guest",
    comment: "SunRise Resort delivers five-star luxury in every detail. From the Michelin-grade gourmet dining to the thermal hydrotherapy spa, we will definitely return every summer!",
    rating: 5,
    award: "Verified Stay 2026"
  },
]

export function TestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState("ALL")

  const filteredReviews = reviews.filter((r) => {
    if (activeCategory === "ALL") return true
    return r.category === activeCategory
  })

  return (
    <section id="reviews" className="py-24 bg-muted/20 border-b border-border/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Press Badges & Recognition */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4 border-b border-border/60 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-primary" />
            <span>Forbes 5-Star Travel Guide 2026</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Star className="size-4 fill-primary text-primary" />
            <span>Michelin Key Winner</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Conde Nast Traveler Top 10 Resort</span>
          </div>
        </div>

        {/* Reviews Header */}
        <div className="space-y-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-primary block">
              Verified Guest Feedback
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-foreground tracking-tight leading-tight">
              Loved by Travelers & VIP Guests Worldwide
            </h2>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { id: "ALL", label: "All Guest Reviews" },
                { id: "COUPLE", label: "Couples & Honeymoons" },
                { id: "FAMILY", label: "Family Villas" },
                { id: "SPA", label: "Spa & Dining Retreats" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredReviews.map((r) => (
              <div key={r.id} className="p-7 rounded-3xl border border-border/80 bg-card shadow-sm space-y-5 flex flex-col justify-between hover:border-primary/50 hover:shadow-2xl transition-all duration-500 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-1">
                      <BadgeCheck className="size-3 text-primary" /> {r.award}
                    </span>
                  </div>

                  <Quote className="size-8 text-primary/20 group-hover:text-primary/40 transition-colors" />

                  <p className="text-sm text-foreground italic font-serif leading-relaxed">
                    "{r.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
