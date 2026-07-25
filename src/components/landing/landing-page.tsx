"use client"

import { Navbar } from "./sections/navbar"
import { HeroSection } from "./sections/hero-section"
import { AboutSection } from "./sections/about-section"
import { RoomsPricingSection } from "./sections/rooms-pricing-section"
import { PackagesSection } from "./sections/packages-section"
import { ExperiencesSection } from "./sections/experiences-section"
import { TestimonialsSection } from "./sections/testimonials-section"
import { FaqContactSection } from "./sections/faq-contact-section"
import { FooterSection } from "./sections/footer-section"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 scroll-smooth transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <RoomsPricingSection />
        <PackagesSection />
        <ExperiencesSection />
        <TestimonialsSection />
        <FaqContactSection />
      </main>
      <FooterSection />
    </div>
  )
}
