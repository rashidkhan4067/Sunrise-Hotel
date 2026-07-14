import { TrendingDown, TrendingUp, DollarSign, Users, UserCheck, Activity } from "lucide-react"
import { StatCard } from "@/components/stat-card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value="$1,250.00"
        icon={DollarSign}
        badgeText="+12.5%"
        badgeIcon={TrendingUp}
        footerText="Trending up this month"
        footerIcon={TrendingUp}
        footerSubtext="Visitors for the last 6 months"
      />
      <StatCard
        title="New Customers"
        value="1,234"
        icon={Users}
        badgeText="-20%"
        badgeIcon={TrendingDown}
        footerText="Down 20% this period"
        footerIcon={TrendingDown}
        footerSubtext="Acquisition needs attention"
      />
      <StatCard
        title="Active Accounts"
        value="45,678"
        icon={UserCheck}
        badgeText="+12.5%"
        badgeIcon={TrendingUp}
        footerText="Strong user retention"
        footerIcon={TrendingUp}
        footerSubtext="Engagement exceed targets"
      />
      <StatCard
        title="Growth Rate"
        value="4.5%"
        icon={Activity}
        badgeText="+4.5%"
        badgeIcon={TrendingUp}
        footerText="Steady performance increase"
        footerIcon={TrendingUp}
        footerSubtext="Meets growth projections"
      />
    </div>
  )
}
