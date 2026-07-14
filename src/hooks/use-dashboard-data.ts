import { useState, useEffect } from "react"
import { fetchDashboardData, type DashboardData } from "@/services/api-service"

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    fetchDashboardData()
      .then((resolvedData) => {
        if (active) {
          setData(resolvedData)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  return { data, loading, error }
}
