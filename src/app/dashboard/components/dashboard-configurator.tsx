"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Settings2, BarChart3, ListTodo, CreditCard } from "lucide-react"
import { useAppStore } from "@/store/use-app-store"
import { Label } from "@/components/ui/label"

export function DashboardConfigurator() {
  const layout = useAppStore((state) => state.dashboardLayout)
  const setLayout = useAppStore((state) => state.setDashboardLayout)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 cursor-pointer">
          <Settings2 className="size-4" />
          <span>Customize Layout</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm leading-none">Dashboard Layout</h4>
            <p className="text-muted-foreground text-xs">
              Toggle visibility of dashboard widgets.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <Label htmlFor="toggle-cards" className="text-xs font-medium cursor-pointer">Stats Cards</Label>
              </div>
              <Switch
                id="toggle-cards"
                checked={layout.cards}
                onCheckedChange={(checked) => setLayout({ cards: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" />
                <Label htmlFor="toggle-chart" className="text-xs font-medium cursor-pointer">Interactive Chart</Label>
              </div>
              <Switch
                id="toggle-chart"
                checked={layout.chart}
                onCheckedChange={(checked) => setLayout({ chart: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="size-4 text-muted-foreground" />
                <Label htmlFor="toggle-table" className="text-xs font-medium cursor-pointer">Data Tables</Label>
              </div>
              <Switch
                id="toggle-table"
                checked={layout.table}
                onCheckedChange={(checked) => setLayout({ table: checked })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
