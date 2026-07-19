"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, LogIn, LogOut, Calendar, Brush, Wrench, XCircle, FileText, Clock } from "lucide-react"
import type { RecentActivity as RecentActivityType } from "@/hooks/use-dashboard-data"

const getActivityDetails = (message: string) => {
  const msg = message.toLowerCase()
  if (msg.includes("check-in") || msg.includes("check in") || msg.includes("checked in")) {
    return {
      tag: "Check-In",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/5",
      textColor: "text-emerald-600 dark:text-emerald-400",
      icon: <LogIn className="h-3.5 w-3.5 text-emerald-500" />
    }
  }
  if (msg.includes("check-out") || msg.includes("check out") || msg.includes("checked out")) {
    return {
      tag: "Check-Out",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/5",
      textColor: "text-blue-600 dark:text-blue-400",
      icon: <LogOut className="h-3.5 w-3.5 text-blue-500" />
    }
  }
  if (msg.includes("booked") || msg.includes("booking") || msg.includes("reservation")) {
    return {
      tag: "Reservation",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/5",
      textColor: "text-indigo-600 dark:text-indigo-400",
      icon: <Calendar className="h-3.5 w-3.5 text-indigo-500" />
    }
  }
  if (msg.includes("clean") || msg.includes("cleaning") || msg.includes("housekeeping")) {
    return {
      tag: "Housekeeping",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
      textColor: "text-amber-600 dark:text-amber-400",
      icon: <Brush className="h-3.5 w-3.5 text-amber-500" />
    }
  }
  if (msg.includes("maintenance") || msg.includes("repair")) {
    return {
      tag: "Maintenance",
      bgColor: "bg-rose-500/10 dark:bg-rose-500/5",
      textColor: "text-rose-600 dark:text-rose-400",
      icon: <Wrench className="h-3.5 w-3.5 text-rose-500" />
    }
  }
  if (msg.includes("cancel") || msg.includes("cancelled")) {
    return {
      tag: "Cancellation",
      bgColor: "bg-red-500/10 dark:bg-red-500/5",
      textColor: "text-red-600 dark:text-red-400",
      icon: <XCircle className="h-3.5 w-3.5 text-red-500" />
    }
  }
  return {
    tag: "System",
    bgColor: "bg-slate-500/10 dark:bg-slate-500/5",
    textColor: "text-slate-600 dark:text-slate-400",
    icon: <FileText className="h-3.5 w-3.5 text-slate-500" />
  }
}

export function RecentActivity({ activities }: { activities: RecentActivityType[] }) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <Activity className="h-4 w-4 text-primary" />
          Live Activities Log
        </CardTitle>
        <CardDescription className="text-xs">Chronological operational events and notifications log</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic">
            No recent activity recorded.
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {activities.map((act, idx) => {
              const { tag, bgColor, textColor, icon } = getActivityDetails(act.message)
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-background/30 flex gap-3 items-start hover:bg-background/80 hover:shadow-xs transition-all duration-200"
                >
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {icon}
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`${bgColor} ${textColor} border-none text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider`}>
                        {tag}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {act.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
