"use client"

import React from 'react'
import { useTheme } from '@/hooks/use-theme'
import { baseColors } from '@/config/theme-customizer-constants'
import { colorThemes } from '@/config/theme-data'
import type { ThemePreset, ImportedTheme } from '@/types/theme-customizer'

export function useThemeManager() {
  const { theme, setTheme } = useTheme()
  const [brandColorsValues, setBrandColorsValues] = React.useState<Record<string, string>>({})

  // Simple, reliable theme detection - just follow the theme provider
  const isDarkMode = React.useMemo(() => {
    if (theme === "dark") return true
    if (theme === "light") return false
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }, [theme])

  const resetTheme = React.useCallback(() => {
    // Instant cleanup of inline style overrides without DOM thrashing
    const root = document.documentElement
    root.removeAttribute('style')
  }, [])

  const updateBrandColorsFromTheme = React.useCallback((styles: Record<string, string>) => {
    const newValues: Record<string, string> = {}
    baseColors.forEach(color => {
      const cssVar = color.cssVar.replace('--', '')
      if (styles[cssVar]) {
        newValues[color.cssVar] = styles[cssVar]
      }
    })
    setBrandColorsValues(newValues)
  }, [])

  const applyTheme = React.useCallback((themeValue: string, darkMode: boolean) => {
    const theme = colorThemes.find(t => t.value === themeValue)
    if (!theme) return

    const styles = darkMode ? theme.preset.styles.dark : theme.preset.styles.light
    const root = document.documentElement

    // Defer style injection so the browser paints the selection immediately (<10ms INP)
    setTimeout(() => {
      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
      updateBrandColorsFromTheme(styles)
    }, 40)
  }, [updateBrandColorsFromTheme])

  const applyTweakcnTheme = React.useCallback((themePreset: ThemePreset, darkMode: boolean) => {
    const styles = darkMode ? themePreset.styles.dark : themePreset.styles.light
    const root = document.documentElement

    // Defer style injection so the browser paints the selection immediately (<10ms INP)
    setTimeout(() => {
      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
      updateBrandColorsFromTheme(styles)
    }, 40)
  }, [updateBrandColorsFromTheme])

  const applyImportedTheme = React.useCallback((themeData: ImportedTheme, darkMode: boolean) => {
    const root = document.documentElement
    const themeVars = darkMode ? themeData.dark : themeData.light
    
    setTimeout(() => {
      Object.entries(themeVars).forEach(([variable, value]) => {
        root.style.setProperty(`--${variable}`, value)
      })
      
      const newBrandColors: Record<string, string> = {}
      baseColors.forEach(color => {
        const varName = color.cssVar.replace('--', '')
        if (themeVars[varName]) {
          newBrandColors[color.cssVar] = themeVars[varName]
        }
      })
      setBrandColorsValues(newBrandColors)
    }, 40)
  }, [])

  const applyRadius = (radius: string) => {
    document.documentElement.style.setProperty('--radius', radius)
  }

  const handleColorChange = (cssVar: string, value: string) => {
    document.documentElement.style.setProperty(cssVar, value)
  }

  return {
    theme,
    setTheme,
    isDarkMode,
    brandColorsValues,
    setBrandColorsValues,
    resetTheme,
    applyTheme,
    applyTweakcnTheme,
    applyImportedTheme,
    applyRadius,
    handleColorChange,
    updateBrandColorsFromTheme
  }
}
