import dashboardData from "@/app/dashboard/data/data.json"
import pastPerformanceData from "@/app/dashboard/data/past-performance-data.json"
import keyPersonnelData from "@/app/dashboard/data/key-personnel-data.json"
import focusDocumentsData from "@/app/dashboard/data/focus-documents-data.json"

export interface DashboardData {
  data: typeof dashboardData
  pastPerformanceData: typeof pastPerformanceData
  keyPersonnelData: typeof keyPersonnelData
  focusDocumentsData: typeof focusDocumentsData
}

export function fetchDashboardData(): Promise<DashboardData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: dashboardData,
        pastPerformanceData,
        keyPersonnelData,
        focusDocumentsData,
      })
    }, 500)
  })
}
