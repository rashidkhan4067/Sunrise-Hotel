import type { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  badgeText: string
  badgeVariant?: "outline" | "default" | "secondary" | "destructive"
  badgeClassName?: string
  badgeIcon?: LucideIcon
  footerText: string
  footerSubtext?: string
  footerIcon?: LucideIcon
}

export function StatCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeVariant = "outline",
  badgeClassName,
  badgeIcon: BadgeIcon,
  footerText,
  footerSubtext,
  footerIcon: FooterIcon,
}: StatCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center justify-between gap-2">
          <span>{title}</span>
          <Icon className="text-muted-foreground size-4" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant={badgeVariant} className={badgeClassName}>
            {BadgeIcon && <BadgeIcon className="size-3" />}
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footerText} {FooterIcon && <FooterIcon className="size-4" />}
        </div>
        {footerSubtext && (
          <div className="text-muted-foreground">
            {footerSubtext}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
