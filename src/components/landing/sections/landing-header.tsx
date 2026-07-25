"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Shield, ArrowRight } from "lucide-react"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo className="size-8 text-primary transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-foreground leading-none">
              SunRise <span className="text-primary font-black">PMS</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mt-0.5">
              Enterprise Hotel Engine
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          <a href="#roles" className="hover:text-primary transition-colors">Role Features</a>
          <a href="#features" className="hover:text-primary transition-colors">Platform Capabilities</a>
          <a href="#metrics" className="hover:text-primary transition-colors">Performance Metrics</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2.5">
          <Link to="/auth/sign-in">
            <Button variant="ghost" size="sm" className="text-xs font-bold h-9 cursor-pointer">
              Sign In
            </Button>
          </Link>

          <Link to="/admin/dashboard">
            <Button size="sm" className="bg-primary text-primary-foreground font-extrabold text-xs h-9 px-3.5 gap-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer">
              <Shield className="size-3.5" />
              <span>Admin Console</span>
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
