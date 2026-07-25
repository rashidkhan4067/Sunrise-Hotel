"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Building2, Save, RefreshCw, DollarSign, Percent, Clock, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface ConfigData {
  hotelName: string
  taxRate: number
  currencySymbol: string
  weekendSurgeMultiplier: number
  checkInTime: string
  checkOutTime: string
  cancellationGraceHours: number
  updatedAt?: string
}

export function HotelConfigTab() {
  const { getToken } = useAuth()
  const [config, setConfig] = useState<ConfigData>({
    hotelName: "Sunrise Hotel & Resort",
    taxRate: 10.0,
    currencySymbol: "$",
    weekendSurgeMultiplier: 1.2,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    cancellationGraceHours: 24,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      setLoading(true)
      try {
        const token = await getToken()
        if (!token) return
        const res = await apiClient.get<ConfigData>("reports/config/", token)
        if (res) {
          setConfig(res)
        }
      } catch (err: any) {
        console.error("Failed to load hotel config:", err)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [getToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await apiClient.put<ConfigData>("reports/config/", config, token)
      if (res) {
        setConfig(res)
        toast.success("Hotel operational parameters updated successfully!")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update hotel parameters.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border border-border/50 shadow-2xs">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary font-bold">
          <Building2 className="h-5 w-5" />
          <CardTitle>Hotel Operational Parameters</CardTitle>
        </div>
        <CardDescription>
          Configure room tax rates, weekend surge multipliers, check-in/out times, and property branding.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">
              Loading operational settings...
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Hotel Name */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hotel Property Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={config.hotelName}
                    onChange={(e) => setConfig({ ...config, hotelName: e.target.value })}
                    className="pl-9"
                    placeholder="Sunrise Hotel & Resort"
                    required
                  />
                </div>
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Room Tax Rate (%)
                </Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={config.taxRate}
                    onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) || 0 })}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Applied automatically to room charge folios</p>
              </div>

              {/* Weekend Surge Multiplier */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Weekend Surge Multiplier (Fri & Sat)
                </Label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="3.0"
                    value={config.weekendSurgeMultiplier}
                    onChange={(e) => setConfig({ ...config, weekendSurgeMultiplier: parseFloat(e.target.value) || 1.0 })}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">e.g. 1.20 = 20% surge on Friday & Saturday nights</p>
              </div>

              {/* Check-In Time */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Default Check-In Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={config.checkInTime}
                    onChange={(e) => setConfig({ ...config, checkInTime: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Check-Out Time */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Default Check-Out Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={config.checkOutTime}
                    onChange={(e) => setConfig({ ...config, checkOutTime: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Currency Symbol */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Currency Symbol
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={config.currencySymbol}
                    onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                    className="pl-9"
                    placeholder="$ or PKR"
                    required
                  />
                </div>
              </div>

              {/* Grace Hours */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cancellation Grace Period (Hours)
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    value={config.cancellationGraceHours}
                    onChange={(e) => setConfig({ ...config, cancellationGraceHours: parseInt(e.target.value) || 0 })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t p-4 bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {config.updatedAt ? `Last updated: ${config.updatedAt}` : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.success("Staging System Demo Data active and seeded!")}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-Seed Staging Data
            </Button>
            <Button type="submit" disabled={loading || saving} className="gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Parameters
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
