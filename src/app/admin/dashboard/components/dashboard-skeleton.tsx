import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="@container/main px-4 lg:px-6 space-y-6 animate-pulse">
      {/* 6 KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10 mt-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Operations & Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operations Skeleton */}
          <Card className="border-border">
            <CardHeader className="space-y-1.5 pb-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <Skeleton className="h-3.5 w-24 mb-1" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-3.5 w-24 mb-1" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings Skeleton */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-28" />
            </CardHeader>
            <CardContent className="p-0 border-t border-border space-y-3 py-4 px-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Room Status, Quick Actions, Upcoming Arrivals, Recent Activity */}
        <div className="space-y-6">
          {/* Room Status Summary Skeleton */}
          <Card className="border-border">
            <CardHeader className="space-y-1.5 pb-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-40" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions Skeleton */}
          <Card className="border-border">
            <CardHeader className="space-y-1.5 pb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-36" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Arrivals Skeleton */}
          <Card className="border-border">
            <CardHeader className="space-y-1.5 pb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </CardHeader>
            <CardContent className="p-0 border-t border-border space-y-3 py-4 px-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card className="border-border">
            <CardHeader className="space-y-1.5 pb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Occupancy Trend Chart Skeleton */}
      <Card className="border-border">
        <CardHeader className="space-y-1.5 pb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[180px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
