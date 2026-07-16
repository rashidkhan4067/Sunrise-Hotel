import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { useEffect, useState } from 'react'
import { initGTM } from '@/utils/analytics'

import { AuthProvider } from '@/contexts/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { ThemeCustomizer, ThemeCustomizerTrigger } from '@/components/theme-customizer'
import { ClerkProvider } from '@clerk/react'

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

import { useNavigate } from 'react-router-dom'

function AppContent({ themeCustomizerOpen, setThemeCustomizerOpen }: { 
  themeCustomizerOpen: boolean; 
  setThemeCustomizerOpen: (open: boolean) => void 
}) {
  const navigate = useNavigate()

  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
    >
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <SidebarConfigProvider>
            <AppRouter />
            <Toaster />

            {/* Global theme customizer — renders on ALL pages (error, auth, admin) */}
            <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
            <ThemeCustomizer
              open={themeCustomizerOpen}
              onOpenChange={setThemeCustomizerOpen}
            />
          </SidebarConfigProvider>
        </ThemeProvider>
      </AuthProvider>
    </ClerkProvider>
  )
}

function App() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)

  // Initialize GTM on app load
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
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
