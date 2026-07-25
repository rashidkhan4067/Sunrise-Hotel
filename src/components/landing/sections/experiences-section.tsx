"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Utensils, Waves, Compass, Sparkles, CheckCircle2, ChevronRight } from "lucide-react"

const experienceTabs = [
  {
    id: "dining",
    icon: Utensils,
    tabLabel: "Michelin Dining",
    tag: "Culinary Excellence",
    title: "Seaside Fine Dining & Rare Wine Cellar",
    desc: "Four signature restaurants offering fresh Mediterranean seafood, organic estate harvests, and sommelier-curated wine pairings against crashing ocean waves.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "4 Michelin-Star Signature Restaurants",
      "Private Sunset Beach Dinners",
      "Organic Farm-to-Table Harvests",
      "Over 1,200 Rare Vintage Wines"
    ]
  },
  {
    id: "spa",
    icon: Sparkles,
    tabLabel: "Thermal Spa",
    tag: "Holistic Wellness",
    title: "Thermal Hydrotherapy Pools & Mineral Pavilion",
    desc: "Restore balance with therapeutic sea salt scrubs, heated volcanic stone massages, and private outdoor cabana treatments surrounded by tropical gardens.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "Thermal Mineral Hydrotherapy Pools",
      "Private Open-Air Spa Pavilions",
      "Certified Holistic Therapists",
      "Daily Beachfront Meditation & Yoga"
    ]
  },
  {
    id: "pools",
    icon: Waves,
    tabLabel: "Infinity Pools",
    tag: "Oceanfront Lounging",
    title: "Temperature-Controlled Oceanfront Pools",
    desc: "Bask in total luxury across three infinity edge pools overlooking the private bay, complete with private daybeds, chilled towels, and hand-crafted cocktails.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "3 Temperature-Controlled Infinity Pools",
      "Private VIP Daybed Cabana Reservations",
      "Underwater Sound System & Sunset Lights",
      "All-Day Poolside Artisan Cocktail Bar"
    ]
  },
  {
    id: "yacht",
    icon: Compass,
    tabLabel: "Yacht Expeditions",
    tag: "Coastal Excursions",
    title: "Private Yacht & Snorkeling Charters",
    desc: "Embark on private luxury yacht expeditions along pristine coral reefs, golden hour sunset champagne cruises, and secluded island picnic drops.",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "55ft Private Luxury Motor Yacht Fleet",
      "Guided Coral Reef Snorkeling Trips",
      "Sunset Champagne & Caviar Cruises",
      "Private Island Beach Picnic Drops"
    ]
  }
]

export function ExperiencesSection() {
  const [activeTab, setActiveTab] = useState("dining")
  const currentExp = experienceTabs.find((t) => t.id === activeTab) || experienceTabs[0]

  return (
    <section id="experiences" className="py-24 bg-background border-b border-border/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <Badge variant="outline" className="text-[11px] font-black tracking-[0.25em] uppercase px-4 py-1.5 border-primary/40 text-primary bg-primary/10 rounded-full">
            Curated Resort Experiences
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-foreground tracking-tight font-normal leading-tight">
            Indulge in Extraordinary Moments
          </h2>
          <p className="text-base text-muted-foreground font-sans font-normal leading-relaxed max-w-xl mx-auto">
            From thermal spa hydrotherapy to sunset yacht cruises, every experience at SunRise Hotel is crafted for wonder.
          </p>

          {/* Experience Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            {experienceTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.tabLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Feature Hero Highlight */}
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
          <div className="lg:col-span-7 h-80 lg:h-[480px] relative overflow-hidden">
            <img
              key={currentExp.id}
              src={currentExp.image}
              alt={currentExp.title}
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card/80 via-transparent to-transparent lg:hidden" />
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-widest border border-border/60 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="size-3 text-primary" />
                {currentExp.tag}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 p-7 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resort Feature</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight">
                {currentExp.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans font-medium">
                {currentExp.desc}
              </p>

              <div className="space-y-3 pt-2">
                {currentExp.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-foreground font-semibold">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/60">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline cursor-pointer group"
              >
                <span>Reserve Experience via Concierge</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
