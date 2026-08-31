"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo)

    // Check if error is due to a stale chunk from a recent deployment
    const isChunkError =
      error?.message?.includes("dynamically imported module") ||
      error?.message?.includes("Failed to fetch dynamically imported") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.name === "ChunkLoadError"

    if (isChunkError) {
      const lastReload = sessionStorage.getItem("chunk_reload_timestamp")
      const now = Date.now()
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("chunk_reload_timestamp", now.toString())
        window.location.reload()
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                <AlertTriangle size={36} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                An unexpected error occurred in the application view. We apologize for the inconvenience.
              </p>
              {this.state.error && (
                <div className="w-full max-h-32 overflow-auto rounded-lg bg-muted p-3 text-left text-xs font-mono text-muted-foreground border border-border">
                  {this.state.error.toString()}
                </div>
              )}
              <div className="flex gap-3 w-full mt-2">
                <Button 
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  variant="default"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  variant="outline"
                >
                  <Home size={16} />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
