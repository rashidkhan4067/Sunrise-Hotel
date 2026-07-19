"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Command as CommandPrimitive } from "cmdk"
import {
  Search,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Bed,
  Contact,
  Users,
  BarChart3,
  Settings,
  User,
  Moon,
  Sun,
  Laptop,
  LogOut,
  Sliders,
  Key,
  type LucideIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-12 w-full border-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-muted-foreground border-b border-border mb-4",
      className
    )}
    {...props}
  />
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[400px] overflow-y-auto overflow-x-hidden pb-2", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="flex h-12 items-center justify-center text-sm text-muted-foreground"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&:not(:first-child)]:mt-2",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-12 cursor-pointer select-none items-center gap-2 rounded-lg px-4 text-sm text-foreground/90 outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&+[cmdk-item]]:mt-1",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

interface SearchItem {
  title: string
  url?: string
  action?: () => void
  group: string
  icon?: LucideIcon
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { logout, isAuthenticated } = useAuth()
  const commandRef = React.useRef<HTMLDivElement>(null)

  const searchItems: SearchItem[] = [
    // Hotel Modules
    { title: "Dashboard", url: "/admin/dashboard", group: "Hotel", icon: LayoutDashboard },
    { title: "Bookings", url: "/admin/bookings", group: "Hotel", icon: ClipboardList },
    { title: "Booking Calendar", url: "/admin/calendar", group: "Hotel", icon: CalendarDays },
    { title: "Rooms", url: "/admin/rooms", group: "Hotel", icon: Bed },
    { title: "Guests", url: "/admin/guests", group: "Hotel", icon: Contact },
    { title: "Staff", url: "/admin/users", group: "Hotel", icon: Users },
    { title: "Reports", url: "/admin/reports", group: "Hotel", icon: BarChart3 },

    // Settings
    { title: "Hotel Information", url: "/admin/settings/hotel", group: "Settings", icon: Settings },
    { title: "User Profile", url: "/admin/settings/user", group: "Settings", icon: User },
    { title: "Password Settings", url: "/admin/settings/password", group: "Settings", icon: Key },
    { title: "System Preferences", url: "/admin/settings/preferences", group: "Settings", icon: Sliders },

    // Theme Actions
    {
      title: "Set Theme to Dark",
      action: () => { setTheme("dark"); toast.success("Theme changed to Dark") },
      group: "Actions",
      icon: Moon,
    },
    {
      title: "Set Theme to Light",
      action: () => { setTheme("light"); toast.success("Theme changed to Light") },
      group: "Actions",
      icon: Sun,
    },
    {
      title: "Set Theme to System",
      action: () => { setTheme("system"); toast.success("Theme changed to System Preference") },
      group: "Actions",
      icon: Laptop,
    },
  ]

  // Add Sign Out if authenticated
  if (isAuthenticated) {
    searchItems.push({
      title: "Sign Out",
      action: async () => {
        await logout()
        toast.success("Logged out successfully!")
        navigate("/auth/sign-in")
      },
      group: "Actions",
      icon: LogOut,
    })
  }

  const groupedItems = searchItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  const handleSelect = (item: SearchItem) => {
    if (item.action) {
      item.action()
    } else if (item.url) {
      navigate(item.url)
    }
    onOpenChange(false)
    // Bounce effect like Vercel
    if (commandRef.current) {
      commandRef.current.style.transform = 'scale(0.96)'
      setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = ''
        }
      }, 100)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border border-border max-w-[640px]">
        <DialogTitle className="sr-only">Command Search</DialogTitle>
        <Command
          ref={commandRef}
          className="transition-transform duration-100 ease-out"
        >
          <CommandInput placeholder="What do you need?" autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedItems).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.title}
                      value={item.title}
                      onSelect={() => handleSelect(item)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {item.title}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg text-xs font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        "border border-border/80 bg-muted/30 hover:bg-muted/65 hover:border-border",
        "h-8.5 w-10 md:w-48 lg:w-64 justify-center md:justify-start px-2.5 text-muted-foreground hover:text-foreground cursor-pointer relative shadow-3xs"
      )}
    >
      <Search className="size-3.5 shrink-0 text-muted-foreground/70" />
      <span className="hidden md:inline-flex text-[11px] font-medium">Search actions...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-0.5 rounded border border-border/70 bg-background px-1.5 font-mono text-[9px] font-bold text-muted-foreground/80 shadow-3xs lg:flex">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  )
}
