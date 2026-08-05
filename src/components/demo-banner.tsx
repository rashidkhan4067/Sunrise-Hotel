import { useEffect } from "react"

export function DemoBanner() {
  useEffect(() => {
    document.documentElement.style.setProperty("--banner-height", "0px")
  }, [])

  return null
}


