import { Users, CreditCard, UserCheck, Clock5, TrendingUp, TrendingDown } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { cn } from "@/lib/utils"

const performanceMetrics = [
  {
    title: "Total Users",
    current: "24,850",
    previous: "18,400",
    growth: 33.3,
    icon: Users,
  },
  {
    title: "Paid Users",
    current: "12,500",
    previous: "9,200",
    growth: 35.9,
    icon: CreditCard,
  },
  {
    title: "Active Users",
    current: "8,900",
    previous: "6,700",
    growth: 32.8,
    icon: UserCheck,
  },
  {
    title: "Pending Users",
    current: "1,245",
    previous: "1,350",
    growth: -8.0,
    icon: Clock5,
  },
]

export function StatCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => {
        const isPositive = metric.growth >= 0
        return (
          <StatCard
            key={index}
            title={metric.title}
            value={metric.current}
            icon={metric.icon}
            badgeText={`${isPositive ? "+" : ""}${metric.growth}%`}
            badgeIcon={isPositive ? TrendingUp : TrendingDown}
            badgeClassName={cn(
              isPositive
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
            )}
            footerText={`${isPositive ? "Increased" : "Decreased"} this period`}
            footerIcon={isPositive ? TrendingUp : TrendingDown}
            footerSubtext={`from ${metric.previous} previously`}
          />
        )
      })}
    </div>
  )
}
