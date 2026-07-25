"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, Phone, Mail, Send, CheckCircle2, HelpCircle } from "lucide-react"
import { toast } from "sonner"

const faqs = [
  {
    q: "What are the resort check-in and check-out times?",
    a: "Standard check-in begins at 3:00 PM and check-out is at 11:00 AM. Early arrival and late departure requests can be arranged via your guest concierge portal.",
  },
  {
    q: "Does SunRise Hotel offer airport transfers and valet parking?",
    a: "Yes, we provide 24/7 private luxury airport shuttles, private helipad transfers, and complimentary valet parking for all registered guests.",
  },
  {
    q: "How does the In-House Guest Concierge Chat work?",
    a: "Once checked in, you can log into your Guest Portal from any mobile device to message reception directly for room service, extra towels, or spa reservations with sub-minute response times.",
  },
  {
    q: "Are pets allowed at the resort?",
    a: "We welcome small dogs up to 25 lbs in designated Pet-Friendly Ocean Suites. Please inform reservations prior to arrival.",
  },
]

export function FaqContactSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) return
    setSubmitted(true)
    toast.success("Thank you! Your hotel reservation inquiry has been dispatched to concierge.")
  }

  return (
    <section id="contact" className="py-24 bg-background border-b border-border/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <Badge variant="outline" className="text-[11px] font-black tracking-[0.25em] uppercase px-4 py-1.5 border-primary/40 text-primary bg-primary/10 rounded-full">
            Concierge & Reservations
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-foreground tracking-tight leading-tight">
            Plan Your Stay With Us
          </h2>
          <p className="text-base text-muted-foreground font-sans font-normal leading-relaxed">
            Have questions regarding room availability, private helipad transfers, or custom vacation packages? Our VIP concierge team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: FAQ Accordion */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="font-serif font-bold text-xl text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              Frequently Asked Questions
            </h3>
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <div key={faq.q} className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left font-bold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10 font-sans font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Direct Reservation Inquiry */}
          <div className="lg:col-span-6 p-8 rounded-3xl border border-border/80 bg-card shadow-2xl space-y-5">
            <h3 className="font-serif font-bold text-2xl text-foreground">Direct Reservation Inquiry</h3>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground bg-muted/20 p-4 rounded-2xl border border-border/50">
              <div>
                <p className="font-extrabold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Phone className="size-3.5 text-primary" /> Hotline
                </p>
                <p className="font-semibold text-foreground mt-0.5">+1 (800) 555-7867</p>
              </div>
              <div>
                <p className="font-extrabold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Mail className="size-3.5 text-primary" /> Email
                </p>
                <p className="font-semibold text-foreground mt-0.5">concierge@sunrisehotel.com</p>
              </div>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
                <h4 className="font-serif font-bold text-lg text-foreground">Inquiry Dispatched!</h4>
                <p className="text-xs text-muted-foreground">
                  Our reservation team will contact you at <span className="font-bold text-foreground">{email}</span> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Full Name</label>
                    <Input
                      placeholder="E.g., Rashid Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="text-xs bg-muted/20 h-10 border-border/70 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Email Address</label>
                    <Input
                      type="email"
                      placeholder="rashid@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-xs bg-muted/20 h-10 border-border/70 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Inquiry Details</label>
                  <Textarea
                    placeholder="Stay dates, suite preferences, or special requests..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="text-xs min-h-[90px] bg-muted/20 border-border/70 rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest h-11 rounded-2xl gap-2 cursor-pointer shadow-md">
                  <Send className="size-3.5" />
                  Dispatch Reservation Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
