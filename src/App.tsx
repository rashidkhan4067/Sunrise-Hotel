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

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

function App() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)

  // Initialize GTM on app load
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <SidebarConfigProvider>
              <Router basename={basename}>
                <AppRouter />
              </Router>
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
      </ErrorBoundary>
    </div>
  )
}

export default App
