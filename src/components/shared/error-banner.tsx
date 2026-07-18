import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div
      className={`flex items-center gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 ${
        className ?? ""
      }`}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Retry
        </Button>
      )}
    </div>
  )
}
