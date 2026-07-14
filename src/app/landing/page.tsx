"use client"

import React from 'react'
import { LandingNavbar } from './components/navbar'
import { HeroSection } from './components/hero-section'
import { LogoCarousel } from './components/logo-carousel'
import { StatsSection } from './components/stats-section'
import { FeaturesSection } from './components/features-section'
import { TeamSection } from './components/team-section'
import { TestimonialsSection } from './components/testimonials-section'
import { BlogSection } from './components/blog-section'
import { PricingSection } from './components/pricing-section'
import { CTASection } from './components/cta-section'
import { ContactSection } from './components/contact-section'
import { FaqSection } from './components/faq-section'
import { LandingFooter } from './components/footer'
import { LandingThemeCustomizer, LandingThemeCustomizerTrigger } from './components/landing-theme-customizer'
import { AboutSection } from './components/about-section'

export default function LandingPage() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        <LogoCarousel />
        <div className="content-visibility-auto"><StatsSection /></div>
        <div className="content-visibility-auto"><AboutSection /></div>
        <div className="content-visibility-auto"><FeaturesSection /></div>
        <div className="content-visibility-auto"><TeamSection /></div>
        <div className="content-visibility-auto"><PricingSection /></div>
        <div className="content-visibility-auto"><TestimonialsSection /></div>
        <div className="content-visibility-auto"><BlogSection /></div>
        <div className="content-visibility-auto"><FaqSection /></div>
        <div className="content-visibility-auto"><CTASection /></div>
        <div className="content-visibility-auto"><ContactSection /></div>
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Theme Customizer */}
      <LandingThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
      <LandingThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />
    </div>
  )
}
