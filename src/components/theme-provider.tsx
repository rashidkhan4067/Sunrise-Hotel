"use client"

import * as React from "react"
import { ThemeProviderContext } from "@/contexts/theme-context"
import { STORAGE_KEYS } from "@/config/site-config"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Restore persisted CSS token overrides from the theme customizer.
// This runs once at root level so variables survive all page navigations.
function restoreCustomizerTheme(isDarkMode: boolean) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.themeCustomizer)
    if (!raw) return
    const { selectedTheme, selectedTweakcnTheme, selectedRadius, importedTheme } = JSON.parse(raw)

    const root = document.documentElement

    // Apply border radius
    if (selectedRadius) {
      root.style.setProperty("--radius", selectedRadius)
    }

    const applyStyles = (styles: Record<string, string>) => {
      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    }

    if (importedTheme) {
      const vars = isDarkMode ? importedTheme.dark : importedTheme.light
      if (vars) applyStyles(vars)
    } else if (selectedTheme) {
      // Dynamically import shadcn presets to avoid bundle bloat at this level
      import("@/utils/shadcn-ui-theme-presets").then(({ shadcnThemePresets }) => {
        const preset = shadcnThemePresets[selectedTheme as keyof typeof shadcnThemePresets]
        if (preset?.styles) {
          const styles = isDarkMode ? preset.styles.dark : preset.styles.light
          if (styles) applyStyles(styles as Record<string, string>)
        }
      })
    } else if (selectedTweakcnTheme) {
      import("@/utils/tweakcn-theme-presets").then(({ tweakcnPresets }) => {
        const preset = tweakcnPresets[selectedTweakcnTheme as keyof typeof tweakcnPresets]
        if (preset?.styles) {
          const styles = isDarkMode ? preset.styles.dark : preset.styles.light
          if (styles) applyStyles(styles as Record<string, string>)
        }
      })
    }
  } catch {
    // silently fail — don't break the app if localStorage is unavailable
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEYS.theme,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let resolvedDark: boolean
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      resolvedDark = systemTheme === "dark"
    } else {
      root.classList.add(theme)
      resolvedDark = theme === "dark"
    }

    // Re-apply customizer color tokens whenever the base theme changes
    restoreCustomizerTheme(resolvedDark)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
