"use client"

import * as React from "react"
import { Sparkles, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CtaBannerProps {
  id?: string
  variant?: "promo" | "operational" | "upgrade" | "info"
  badgeText?: string
  title: string
  description: string
  icon?: React.ComponentType<any>
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  dismissible?: boolean
  className?: string
}

export function CtaBanner({
  id = "cta-banner",
  variant = "promo",
  badgeText,
  title,
  description,
  icon: Icon = Sparkles,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  dismissible = true,
  className,
}: CtaBannerProps) {
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    const isDismissed = localStorage.getItem(`cta_dismissed_${id}`)
    if (isDismissed === "true") {
      setDismissed(true)
    }
  }, [id])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(`cta_dismissed_${id}`, "true")
  }

  if (dismissed) return null

  const themeConfig = {
    promo: {
      wrapper: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20",
      badgeBg: "bg-primary/15 text-primary",
      buttonBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    operational: {
      wrapper: "bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border-primary/15",
      badgeBg: "bg-primary/15 text-primary",
      buttonBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    upgrade: {
      wrapper: "bg-gradient-to-r from-primary/10 via-accent/20 to-transparent border-primary/20",
      badgeBg: "bg-primary/15 text-primary",
      buttonBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    info: {
      wrapper: "bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent border-emerald-500/20",
      badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      buttonBg: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
  }[variant]

  const badgeLabel = badgeText || {
    promo: "Special Offer",
    operational: "Front Desk Alert",
    upgrade: "Room Upgrade",
    info: "System Notice",
  }[variant]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-xs",
        themeConfig.wrapper,
        className
      )}
    >
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left Column: Badge, Title & Description */}
        <div className="space-y-2.5 max-w-xl pr-6 md:pr-0">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide select-none",
              themeConfig.badgeBg
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{badgeLabel}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-foreground">
            {title}
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Right Column: Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0 w-full md:w-auto">
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="lg"
              onClick={onSecondaryAction}
              className="cursor-pointer font-semibold text-sm h-11 px-5"
            >
              {secondaryActionLabel}
            </Button>
          )}

          {actionLabel && onAction && (
            <Button
              size="lg"
              onClick={onAction}
              className={cn(
                "shrink-0 hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer font-semibold text-sm h-11 px-6 shadow-xs",
                themeConfig.buttonBg
              )}
            >
              <span>{actionLabel}</span>
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Decorative Glow Orb */}
      <div className="absolute top-1/2 right-0 -z-0 size-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer z-20"
          title="Dismiss Banner"
          aria-label="Dismiss Banner"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
