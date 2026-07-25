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
    q: "What are standard check-in and check-out times?",
    a: "Standard check-in begins at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out options are available upon request through your Concierge Portal.",
  },
  {
    q: "Does SunRise Hotel offer airport transfers and valet parking?",
    a: "Yes, we provide 24/7 private luxury airport shuttles and complimentary valet parking for all registered guests.",
  },
  {
    q: "How does the In-House Guest Concierge Live Chat work?",
    a: "Once checked in, you can log into your Guest Portal from any mobile device to message reception directly for extra towels, room service, or maintenance with sub-minute response times.",
  },
  {
    q: "Are pets allowed at the resort?",
    a: "We welcome small dogs up to 25 lbs in designated Pet-Friendly Deluxe Suites. Please inform reservations prior to arrival.",
  },
]

export function ContactFaqSection() {
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
    <section id="contact" className="py-20 bg-muted/15 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="text-xs font-bold px-3 py-1 border-primary/30 text-primary">
            Concierge & Guest Support
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Guest FAQs & Reservations Directory
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: FAQ Accordion */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="font-extrabold text-base text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="size-4 text-primary" />
              Frequently Asked Questions
            </h3>
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <div key={faq.q} className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left font-bold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-3.5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Contact & Inquiry Form */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Direct Concierge Reservation Inquiry</h3>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
              <div>
                <p className="font-bold text-foreground flex items-center gap-1"><Phone className="size-3 text-primary" /> Hotline</p>
                <p>+1 (800) 555-SUNRISE</p>
              </div>
              <div>
                <p className="font-bold text-foreground flex items-center gap-1"><Mail className="size-3 text-primary" /> Email</p>
                <p>concierge@sunrisehotel.com</p>
              </div>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                <h4 className="font-black text-xs text-foreground">Inquiry Dispatched!</h4>
                <p className="text-xs text-muted-foreground">
                  Our front desk team will contact you at <span className="font-bold text-foreground">{email}</span> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Full Name</label>
                    <Input
                      placeholder="E.g., Rashid Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="text-xs bg-muted/20 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Email Address</label>
                    <Input
                      type="email"
                      placeholder="rashid@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-xs bg-muted/20 h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Inquiry Details</label>
                  <Textarea
                    placeholder="Stay dates, suite preferences, or special requests..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="text-xs min-h-[85px] bg-muted/20"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold text-xs h-9 gap-1.5 cursor-pointer">
                  <Send className="size-3.5" />
                  Dispatch Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
