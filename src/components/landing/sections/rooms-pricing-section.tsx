"use client"

import { useState } from "react"
import { Check, Star, Bed, Maximize2, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const suites = [
  {
    id: "deluxe-king",
    category: "OCEAN_VIEW",
    name: "Deluxe King Suite",
    type: "Ocean View",
    sqft: "550 sq ft",
    maxGuests: "2 Guests",
    bed: "King Pillowtop Bed",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    description: "Elegant coastal suite featuring a king bed, private ocean view balcony, and marble rain shower.",
    price: 180,
    features: [
      "Pristine Ocean View Balcony",
      "King Size Luxury Pillowtop Bed",
      "Complimentary Gourmet Breakfast",
      "High-Speed Fiber Wi-Fi",
      "Smart Room Climate Control",
      "24/7 In-Room Service Menu"
    ],
    cta: "Book Deluxe Suite",
    popular: false
  },
  {
    id: "executive-ocean",
    category: "JACUZZI",
    name: "Executive Ocean Suite",
    type: "Jacuzzi Suite",
    sqft: "850 sq ft",
    maxGuests: "3 Guests",
    bed: "Super King Bed",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description: "Spacious luxury suite featuring a private heated balcony Jacuzzi, living room, and VIP lounge access.",
    price: 350,
    features: [
      "Includes all Deluxe features, plus:",
      "Private Heated Balcony Jacuzzi",
      "VIP Lounge & Evening Cocktails",
      "24/7 Personal Butler Service",
      "Complimentary Spa Treatment",
      "Priority Table Reservations",
      "Nespresso Coffee Station"
    ],
    cta: "Book Executive Suite",
    popular: true
  },
  {
    id: "presidential-villa",
    category: "VILLA",
    name: "Presidential Villa",
    type: "Private Haven",
    sqft: "2,200 sq ft",
    maxGuests: "6 Guests",
    bed: "3 King Bedrooms",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-luxury private villa featuring a private oceanfront infinity pool, 360° ocean panorama, and dedicated chef.",
    price: 750,
    features: [
      "Includes all Executive features, plus:",
      "Private Oceanfront Infinity Pool",
      "3 King Bedrooms & Dining Hall",
      "Personal Chef & Private Chauffeur",
      "Helipad Access & Airport Transfer",
      "Unlimited Spa & Wellness Access"
    ],
    cta: "Book Presidential Villa",
    popular: false
  }
]

export function RoomsPricingSection() {
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [selectedSuite, setSelectedSuite] = useState<typeof suites[0] | null>(null)

  const filteredSuites = suites.filter((s) => {
    if (activeCategory === "ALL") return true
    return s.category === activeCategory
  })

  return (
    <section id="suites" className="py-24 bg-muted/20 border-b border-border/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <Badge variant="outline" className="text-[11px] font-black tracking-[0.25em] uppercase px-4 py-1.5 border-primary/40 text-primary bg-primary/10 rounded-full">
            Luxury Accommodations
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-foreground tracking-tight font-normal leading-tight">
            Suites & Villas Designed for Restful Elegance
          </h2>
          <p className="text-base text-muted-foreground font-sans font-normal leading-relaxed">
            Immerse yourself in coastal luxury, panoramic ocean views, and five-star in-room amenities.
          </p>

          {/* Category Filter Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { id: "ALL", label: "All Accommodations" },
              { id: "OCEAN_VIEW", label: "Ocean View Suites" },
              { id: "JACUZZI", label: "Jacuzzi Penthouses" },
              { id: "VILLA", label: "Private Haven Villas" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {filteredSuites.map((s) => (
            <div
              key={s.id}
              className={`rounded-3xl border flex flex-col justify-between transition-all duration-500 relative overflow-hidden group ${
                s.popular
                  ? "bg-card border-primary shadow-xl ring-2 ring-primary/20 scale-[1.02]"
                  : "bg-card border-border/80 shadow-sm hover:border-primary/50 hover:shadow-2xl"
              }`}
            >
              {s.popular && (
                <span className="absolute top-4 right-4 z-10 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Star className="size-3 fill-current" /> Most Requested
                </span>
              )}

              {/* Suite Image Preview */}
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedSuite(s)}
                  className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full bg-background/90 backdrop-blur-md text-foreground text-[11px] font-extrabold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-border/60 shadow-md"
                >
                  <Eye className="size-3.5 text-primary" /> Quick View
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">{s.type}</span>
                      <span className="text-border">•</span>
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                        <Maximize2 className="size-3 text-primary" /> {s.sqft}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans font-medium">{s.description}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl font-serif font-bold text-foreground">${s.price}</span>
                    <span className="text-xs text-muted-foreground font-semibold"> / night (excl. tax)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                    {s.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                        <span className="font-medium text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 space-y-2">
                  <Link to="/guest/bookings">
                    <Button
                      className={`w-full font-black text-xs uppercase tracking-widest h-11 rounded-2xl cursor-pointer transition-all ${
                        s.popular
                          ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                          : "bg-muted hover:bg-primary/10 text-foreground border border-border"
                      }`}
                    >
                      <Bed className="size-4 mr-1.5" />
                      {s.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Suite Detail Modal */}
      {selectedSuite && (
        <Dialog open={!!selectedSuite} onOpenChange={() => setSelectedSuite(null)}>
          <DialogContent className="max-w-2xl bg-card border-border text-card-foreground rounded-3xl p-0 overflow-hidden shadow-2xl">
            <div className="relative h-64 w-full">
              <img
                src={selectedSuite.image}
                alt={selectedSuite.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {selectedSuite.type}
                </span>
                <h3 className="text-3xl font-serif font-bold text-foreground mt-1">{selectedSuite.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center border-y border-border/60 py-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Space</p>
                  <p className="font-extrabold text-foreground">{selectedSuite.sqft}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Occupancy</p>
                  <p className="font-extrabold text-foreground">{selectedSuite.maxGuests}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Bed Type</p>
                  <p className="font-extrabold text-foreground">{selectedSuite.bed}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Included Five-Star Amenities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedSuite.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <div>
                  <span className="text-2xl font-serif font-bold text-foreground">${selectedSuite.price}</span>
                  <span className="text-xs text-muted-foreground font-semibold"> / night</span>
                </div>
                <Link to="/guest/bookings">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest h-11 px-8 rounded-2xl gap-2 cursor-pointer shadow-lg">
                    <span>Reserve Suite Now</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}
