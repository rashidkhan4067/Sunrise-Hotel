import { useEffect, useState } from "react"

export function RouteProgress() {
  const [progress, setProgress] = useState(15)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        // Slow down as progress increases
        const increment = prev < 50 ? 15 : prev < 75 ? 8 : 2
        return prev + increment
      })
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out shadow-[0_0_8px_rgba(var(--primary),0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
