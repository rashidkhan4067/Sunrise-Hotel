import { useEffect } from "react"
import { useAppStore } from "@/store/use-app-store"

export function useDocumentTitle(title?: string) {
  const hotelName = useAppStore.getState().hotelInfo?.hotelName || "SunRise Hotel"

  useEffect(() => {
    if (title) {
      document.title = `${title} - ${hotelName}`
    } else {
      document.title = hotelName
    }
  }, [title, hotelName])
}

