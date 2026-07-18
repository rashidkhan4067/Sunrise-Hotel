import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  badgeText?: string
  badgeVariant?: "outline" | "default" | "secondary" | "destructive"
  badgeClassName?: string
  badgeIcon?: LucideIcon
  footerText?: string
  footerSubtext?: string
  footerIcon?: LucideIcon
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeVariant = "outline",
  badgeClassName = "text-[10px] font-semibold px-1.5 py-0.5 gap-0.5 border-border/40 bg-muted/40 text-foreground/80 rounded-full",
  badgeIcon: BadgeIcon,
  footerText,
  footerSubtext,
  footerIcon: FooterIcon,
  className = "",
}: StatCardProps) {
  return (
    <div className={`border border-border/50 bg-gradient-to-b from-card to-card/90 rounded-xl shadow-2xs hover:shadow-xs hover:border-border/80 transition-all duration-300 p-4 flex flex-col justify-between min-h-[105px] ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase truncate">
            {title}
          </span>
          {Icon && (
            <div className="p-1 rounded-md bg-muted/40 text-muted-foreground/70 border border-border/20 shrink-0">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between gap-1.5">
          <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          {badgeText && (
            <Badge variant={badgeVariant} className={badgeClassName}>
              {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5 shrink-0" />}
              <span>{badgeText}</span>
            </Badge>
          )}
        </div>
      </div>

      {(footerText || footerSubtext) && (
        <div className="mt-2.5 pt-2 border-t border-border/30 flex flex-col gap-0.5">
          {footerText && (
            <div className="flex items-center gap-1 text-[9.5px] font-semibold text-foreground/80">
              <span className="truncate">{footerText}</span>
              {FooterIcon && <FooterIcon className="h-3 w-3 text-muted-foreground shrink-0" />}
            </div>
          )}
          {footerSubtext && (
            <div className="text-[9px] text-muted-foreground leading-normal font-normal truncate">
              {footerSubtext}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

