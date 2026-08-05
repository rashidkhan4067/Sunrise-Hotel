import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { useEffect, useState } from 'react'
import { initGTM } from '@/utils/analytics'

import { AuthProvider } from '@/contexts/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { ThemeCustomizer, ThemeCustomizerTrigger } from '@/components/theme-customizer/main'
import { ClerkProvider } from '@clerk/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DemoBanner } from '@/components/demo-banner'
import { IS_DEMO_MODE } from '@/lib/demo-data'

const queryClient = new QueryClient()

const basename = import.meta.env.VITE_BASENAME || ''
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

import { useNavigate } from 'react-router-dom'

function AppContent({ themeCustomizerOpen, setThemeCustomizerOpen }: {
  themeCustomizerOpen: boolean;
  setThemeCustomizerOpen: (open: boolean) => void
}) {
  const navigate = useNavigate()

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <SidebarConfigProvider>
            <AppRouter />
            <Toaster />
            <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
            <ThemeCustomizer
              open={themeCustomizerOpen}
              onOpenChange={setThemeCustomizerOpen}
            />
          </SidebarConfigProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )

  // In demo mode, skip wrapping with ClerkProvider entirely
  if (IS_DEMO_MODE) return content

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        signInUrl="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        routerPush={(to: string) => navigate(to)}
        routerReplace={(to: string) => navigate(to, { replace: true })}
        telemetry={false}
      >
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <SidebarConfigProvider>
              <AppRouter />
              <Toaster />
              <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
              <ThemeCustomizer
                open={themeCustomizerOpen}
                onOpenChange={setThemeCustomizerOpen}
              />
            </SidebarConfigProvider>
          </ThemeProvider>
        </AuthProvider>
      </ClerkProvider>
    </QueryClientProvider>
  )
}

function App() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)

  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-sans)' }}>
      <ErrorBoundary>
        <Router basename={basename}>
          <AppContent
            themeCustomizerOpen={themeCustomizerOpen}
            setThemeCustomizerOpen={setThemeCustomizerOpen}
          />
        </Router>
      </ErrorBoundary>
    </div>
  )
}

export default App
