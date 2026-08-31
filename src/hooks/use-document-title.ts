import { useEffect } from "react"
import { useAppStore } from "@/store/use-app-store"

export function useDocumentTitle(title?: string, description?: string) {
  const hotelName = useAppStore((state) => state.hotelInfo?.hotelName) || "Sunrise Hotel"

  useEffect(() => {
    if (title) {
      document.title = `${title} | ${hotelName}`
    } else {
      document.title = `${hotelName} | Forbes 5-Star Oceanfront Sanctuary`
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement("meta")
        metaDesc.setAttribute("name", "description")
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute("content", description)
    }
  }, [title, description, hotelName])
}

