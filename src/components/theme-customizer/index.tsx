"use client"

import React from 'react'
import { Layout, Palette, RotateCcw, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { useSidebarConfig } from '@/contexts/sidebar-context'
import { tweakcnThemes } from '@/config/theme-data'
import { ThemeTab } from './theme-tab'
import { LayoutTab } from './layout-tab'
import { ImportModal } from './import-modal'
import { cn } from '@/lib/utils'
import type { ImportedTheme } from '@/types/theme-customizer'
import { STORAGE_KEYS } from '@/config/site-config'

// Helpers: read/write the customizer config to localStorage
const CUSTOMIZER_KEY = STORAGE_KEYS.themeCustomizer

interface CustomizerConfig {
  selectedTheme: string
  selectedTweakcnTheme: string
  selectedRadius: string
  importedTheme: ImportedTheme | null
}

function loadCustomizerConfig(): CustomizerConfig {
  try {
    const raw = localStorage.getItem(CUSTOMIZER_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // Ignore read errors
  }
  return { selectedTheme: "", selectedTweakcnTheme: "", selectedRadius: "0.5rem", importedTheme: null }
}

function saveCustomizerConfig(config: CustomizerConfig) {
  try {
    localStorage.setItem(CUSTOMIZER_KEY, JSON.stringify(config))
  } catch (e) {
    // Ignore write errors
  }
}

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const { applyImportedTheme, isDarkMode, resetTheme, applyRadius, setBrandColorsValues, applyTheme, applyTweakcnTheme } = useThemeManager()
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig()

  const [activeTab, setActiveTab] = React.useState("theme")
  const [importModalOpen, setImportModalOpen] = React.useState(false)

  // Initialize unified customizer state from localStorage
  const [config, setConfig] = React.useState<CustomizerConfig>(() => loadCustomizerConfig())
  const { selectedTheme, selectedTweakcnTheme, selectedRadius, importedTheme } = config

  // Wrapped setters that queue functional state updates with startTransition to eliminate UI blocking
  const setSelectedTheme = (v: string) => {
    React.startTransition(() => {
      setConfig(prev => {
        const next = { ...prev, selectedTheme: v }
        setTimeout(() => saveCustomizerConfig(next), 0)
        return next
      })
    })
  }
  const setSelectedTweakcnTheme = (v: string) => {
    React.startTransition(() => {
      setConfig(prev => {
        const next = { ...prev, selectedTweakcnTheme: v }
        setTimeout(() => saveCustomizerConfig(next), 0)
        return next
      })
    })
  }
  const setSelectedRadius = (v: string) => {
    React.startTransition(() => {
      setConfig(prev => {
        const next = { ...prev, selectedRadius: v }
        setTimeout(() => saveCustomizerConfig(next), 0)
        return next
      })
    })
  }
  const setImportedTheme = (v: ImportedTheme | null) => {
    React.startTransition(() => {
      setConfig(prev => {
        const next = { ...prev, importedTheme: v }
        setTimeout(() => saveCustomizerConfig(next), 0)
        return next
      })
    })
  }

  // On every mount, re-apply the persisted theme CSS variables to the document root
  React.useEffect(() => {
    const { selectedTheme: st, selectedTweakcnTheme: stt, selectedRadius: sr, importedTheme: it } = loadCustomizerConfig()
    if (sr) applyRadius(sr)
    if (it) {
      applyImportedTheme(it, isDarkMode)
    } else if (st) {
      applyTheme(st, isDarkMode)
    } else if (stt) {
      const preset = tweakcnThemes.find(t => t.value === stt)?.preset
      if (preset) applyTweakcnTheme(preset, isDarkMode)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = () => {
    const next = { selectedTheme: "", selectedTweakcnTheme: "", selectedRadius: "0.5rem", importedTheme: null }
    setConfig(next)
    saveCustomizerConfig(next)
    setBrandColorsValues({})
    resetTheme()
    applyRadius("0.5rem")
    updateSidebarConfig({ variant: "inset", collapsible: "offcanvas", side: "left" })
  }

  const handleImport = (themeData: ImportedTheme) => {
    const next = { selectedTheme: "", selectedTweakcnTheme: "", selectedRadius, importedTheme: themeData }
    setConfig(next)
    saveCustomizerConfig(next)
    applyImportedTheme(themeData, isDarkMode)
  }

  const handleImportClick = () => {
    setImportModalOpen(true)
  }

  // Re-apply themes when dark/light mode switches
  React.useEffect(() => {
    if (importedTheme) {
      applyImportedTheme(importedTheme, isDarkMode)
    } else if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode)
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find(t => t.value === selectedTweakcnTheme)?.preset
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode)
      }
    }
  }, [isDarkMode, importedTheme, selectedTheme, selectedTweakcnTheme, applyImportedTheme, applyTheme, applyTweakcnTheme])

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side={sidebarConfig.side === "left" ? "right" : "left"}
          className="w-[400px] p-0 gap-0 pointer-events-auto [&>button]:hidden overflow-hidden flex flex-col"
          onInteractOutside={(e) => {
            // Prevent the sheet from closing when dialog is open
            if (importModalOpen) {
              e.preventDefault()
            }
          }}
        >
          <SheetHeader className="space-y-0 p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-4 w-4" />
              </div>
              <SheetTitle className="text-lg font-semibold">Customizer</SheetTitle>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleReset} className="cursor-pointer h-8 w-8">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => onOpenChange(false)} className="cursor-pointer h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SheetDescription className="text-sm text-muted-foreground sr-only">
              Customize the them and layout of your dashboard.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="py-2">
                <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
                  <TabsTrigger value="theme" className="cursor-pointer data-[state=active]:bg-background"><Palette className="h-4 w-4 mr-1" /> Theme</TabsTrigger>
                  <TabsTrigger value="layout" className="cursor-pointer data-[state=active]:bg-background"><Layout className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
                </TabsList>
                {/* <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
                  <TabsTrigger value="theme" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Palette className="h-4 w-4 mr-1" /> Theme</TabsTrigger>
                  <TabsTrigger value="layout" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Layout className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
                </TabsList> */}
              </div>

              <TabsContent value="theme" className="flex-1 mt-0">
                <ThemeTab
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  selectedTweakcnTheme={selectedTweakcnTheme}
                  setSelectedTweakcnTheme={setSelectedTweakcnTheme}
                  selectedRadius={selectedRadius}
                  setSelectedRadius={setSelectedRadius}
                  setImportedTheme={setImportedTheme}
                  onImportClick={handleImportClick}
                />
              </TabsContent>

              <TabsContent value="layout" className="flex-1 mt-0">
                <LayoutTab />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
      />
    </>
  )
}

// Floating trigger button - positioned dynamically based on sidebar side
export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  const { config: sidebarConfig } = useSidebarConfig()

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-6 h-10 w-10 rounded-full shadow-md z-50 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer group transition-all duration-300 hover:scale-110",
        sidebarConfig.side === "left" ? "right-6" : "left-6"
      )}
      title="Customize Theme"
    >
      <Settings className="h-4.5 w-4.5 transition-transform duration-500 group-hover:rotate-90" />
    </Button>
  )
}
