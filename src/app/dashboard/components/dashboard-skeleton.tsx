import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="@container/main px-4 lg:px-6 space-y-6 animate-pulse">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-40">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-2 mt-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Chart Skeleton */}
      <Card className="h-[400px] w-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60 mt-1" />
          </div>
          <div className="flex border-t sm:border-t-0 sm:border-l">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:w-40">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16 mt-1" />
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-6 py-5 sm:py-6 flex items-end justify-between h-[280px] gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t-md" 
              style={{ height: `${((i * 7) % 50) + 30}%` }}
            />
          ))}
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}
