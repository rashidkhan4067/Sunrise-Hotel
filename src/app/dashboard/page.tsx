"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { DataTable } from "./components/data-table"
import { SectionCards } from "./components/section-cards"

import { DashboardSkeleton } from "./components/dashboard-skeleton"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useAppStore } from "@/store/use-app-store"
import { DashboardConfigurator } from "./components/dashboard-configurator"

export default function Page() {
  const { data, loading } = useDashboardData()
  const layout = useAppStore((state) => state.dashboardLayout)

  return (
    <BaseLayout 
      title="Dashboard" 
      description="Welcome to your admin dashboard"
      actions={<DashboardConfigurator />}
    >
      {loading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="@container/main px-4 lg:px-6 space-y-6">
            {layout.cards && <SectionCards />}
            {layout.chart && <ChartAreaInteractive />}
          </div>
          {layout.table && (
            <div className="@container/main mt-6">
              <DataTable 
                data={data.data} 
                pastPerformanceData={data.pastPerformanceData}
                keyPersonnelData={data.keyPersonnelData}
                focusDocumentsData={data.focusDocumentsData}
              />
            </div>
          )}
          {!layout.cards && !layout.chart && !layout.table && (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg mx-4 lg:mx-6 min-h-[300px] bg-muted/10">
              <p className="text-muted-foreground text-sm font-medium">All dashboard widgets are hidden.</p>
              <p className="text-xs text-muted-foreground mt-1">Use the "Customize Layout" button in the page header to show them again.</p>
            </div>
          )}
        </>
      )}
    </BaseLayout>
  )
}
