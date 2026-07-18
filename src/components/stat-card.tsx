import type { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
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
  badgeClassName = "text-[11px] font-medium px-2 py-0.5 gap-1 border-border/60 bg-muted/40 text-foreground/80 rounded-full",
  badgeIcon: BadgeIcon,
  footerText,
  footerSubtext,
  footerIcon: FooterIcon,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`@container/card border-border/80 bg-card rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 ${className}`}>
      <CardHeader className="p-5 pb-2 space-y-2">
        <CardDescription className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
          <span className="truncate">{title}</span>
          <div className="flex items-center gap-2 shrink-0">
            {Icon && <Icon className="text-muted-foreground/70 h-4 w-4" />}
            {badgeText && (
              <Badge variant={badgeVariant} className={badgeClassName}>
                {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                <span>{badgeText}</span>
              </Badge>
            )}
          </div>
        </CardDescription>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      {(footerText || footerSubtext) && (
        <CardFooter className="p-5 pt-1.5 flex-col items-start gap-0.5 text-xs">
          {footerText && (
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>{footerText}</span>
              {FooterIcon && <FooterIcon className="h-3.5 w-3.5 text-foreground shrink-0" />}
            </div>
          )}
          {footerSubtext && (
            <div className="text-muted-foreground text-[11px] leading-normal">
              {footerSubtext}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
