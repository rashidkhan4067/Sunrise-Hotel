import { Users, UserCheck, Shield, ConciergeBell } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import type { User } from "../types"


interface StatCardsProps {
  users: User[]
}

export function StatCards({ users }: StatCardsProps) {
  const totalStaff = users.length
  const activeStaff = users.filter(u => u.status === "Active").length
  const admins = users.filter(u => u.role === "Admin").length
  const receptionists = users.filter(u => u.role === "Receptionist").length

  const staffMetrics = [
    {
      title: "Total Staff",
      value: String(totalStaff),
      icon: Users,
      description: "Registered team members",
    },
    {
      title: "Active Staff",
      value: String(activeStaff),
      icon: UserCheck,
      description: "Currently active staff",
    },
    {
      title: "Admins",
      value: String(admins),
      icon: Shield,
      description: "System administrators",
    },
    {
      title: "Receptionists",
      value: String(receptionists),
      icon: ConciergeBell,
      description: "Front desk & reservation team",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {staffMetrics.map((metric, index) => (
        <StatCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          footerText={metric.description}
        />
      ))}
    </div>
  )
}
