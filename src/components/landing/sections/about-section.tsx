"use client"

import { Badge } from "@/components/ui/badge"
import { Waves, Utensils, Sparkles, Award } from "lucide-react"

const resortPillars = [
  {
    icon: Waves,
    title: "Pristine Oceanfront Sanctuary",
    description: "Private stretch of powder-white sand beaches, temperature-controlled infinity pools, and exclusive VIP daybed cabana service.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    tag: "Private Beach"
  },
  {
    icon: Utensils,
    title: "Michelin-Star Gourmet Dining",
    description: "Four signature seaside restaurants and in-room dining menus masterfully curated by world-renowned culinary master chefs.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    tag: "4 Restaurants"
  },
  {
    icon: Sparkles,
    title: "Holistic Hydrotherapy Spa",
    description: "Revitalize your senses with therapeutic sea mineral scrubs, volcanic hot stone massages, and outdoor oceanfront wellness pavilions.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    tag: "Thermal Spa"
  },
  {
    icon: Award,
    title: "24/7 Personal Butler Hospitality",
    description: "Enjoy dedicated personal butler concierge support, private luxury motor yacht charters, and bespoke coastal itinerary planning.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    tag: "VIP Butler"
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background border-b border-border/60 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-0 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <Badge variant="outline" className="text-[11px] font-black tracking-[0.25em] uppercase px-4 py-1.5 border-primary/40 text-primary bg-primary/10 rounded-full">
            The SunRise Legacy
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-foreground tracking-tight font-normal leading-tight">
            A Five-Star Haven of Comfort, Elegance & Distinction
          </h2>
          <p className="text-base text-muted-foreground font-sans font-normal leading-relaxed max-w-2xl mx-auto">
            Nestled on the coast, SunRise Hotel merges pristine natural sea beauty with world-class hospitality. Whether seeking a romantic getaway, a family retreat, or a VIP spa escape, our resort delivers unforgettable moments.
          </p>
        </div>

        {/* Feature Stat Counter Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-3xl bg-card border border-border/80 shadow-md text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-foreground">100%</p>
            <p className="text-xs font-black text-primary uppercase tracking-widest">Private Beachfront</p>
            <p className="text-[11px] text-muted-foreground">Turquoise water access</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-foreground">4</p>
            <p className="text-xs font-black text-primary uppercase tracking-widest">Michelin Chefs</p>
            <p className="text-[11px] text-muted-foreground">Seaside fine dining</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-foreground">24/7</p>
            <p className="text-xs font-black text-primary uppercase tracking-widest">Personal Butler</p>
            <p className="text-[11px] text-muted-foreground">Dedicated concierge</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-foreground">5-Star</p>
            <p className="text-xs font-black text-primary uppercase tracking-widest">Forbes Rating</p>
            <p className="text-[11px] text-muted-foreground">International award 2026</p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {resortPillars.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 flex flex-col justify-between group"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-widest border border-border/60 shadow-xs">
                      {p.tag}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
