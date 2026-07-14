"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Command as CommandPrimitive } from "cmdk"
import {
  Search,
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  CreditCard,
  User,
  Bell,
  Link2,
  Palette,
  Moon,
  Sun,
  Laptop,
  LogOut,
  type LucideIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useAppStore } from "@/store/use-app-store"
import { mails } from "@/app/mail/data"

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
  const tasks = useAppStore((state) => state.tasks)
  const commandRef = React.useRef<HTMLDivElement>(null)

  const searchItems: SearchItem[] = [
    // Dashboards
    { title: "Dashboard 1", url: "/dashboard", group: "Dashboards", icon: LayoutDashboard },
    { title: "Dashboard 2", url: "/dashboard-2", group: "Dashboards", icon: LayoutPanelLeft },

    // Apps
    { title: "Mail", url: "/mail", group: "Apps", icon: Mail },
    { title: "Tasks", url: "/tasks", group: "Apps", icon: CheckSquare },
    { title: "Chat", url: "/chat", group: "Apps", icon: MessageCircle },
    { title: "Calendar", url: "/calendar", group: "Apps", icon: Calendar },

    // Auth Pages
    { title: "Sign In 1", url: "/auth/sign-in", group: "Auth Pages", icon: Shield },
    { title: "Sign In 2", url: "/auth/sign-in-2", group: "Auth Pages", icon: Shield },
    { title: "Sign Up 1", url: "/auth/sign-up", group: "Auth Pages", icon: Shield },
    { title: "Sign Up 2", url: "/auth/sign-up-2", group: "Auth Pages", icon: Shield },
    { title: "Forgot Password 1", url: "/auth/forgot-password", group: "Auth Pages", icon: Shield },
    { title: "Forgot Password 2", url: "/auth/forgot-password-2", group: "Auth Pages", icon: Shield },

    // Errors
    { title: "Unauthorized", url: "/errors/unauthorized", group: "Errors", icon: AlertTriangle },
    { title: "Forbidden", url: "/errors/forbidden", group: "Errors", icon: AlertTriangle },
    { title: "Not Found", url: "/errors/not-found", group: "Errors", icon: AlertTriangle },
    { title: "Internal Server Error", url: "/errors/internal-server-error", group: "Errors", icon: AlertTriangle },
    { title: "Under Maintenance", url: "/errors/under-maintenance", group: "Errors", icon: AlertTriangle },

    // Settings
    { title: "User Settings", url: "/settings/user", group: "Settings", icon: User },
    { title: "Account Settings", url: "/settings/account", group: "Settings", icon: Settings },
    { title: "Plans & Billing", url: "/settings/billing", group: "Settings", icon: CreditCard },
    { title: "Appearance", url: "/settings/appearance", group: "Settings", icon: Palette },
    { title: "Notifications", url: "/settings/notifications", group: "Settings", icon: Bell },
    { title: "Connections", url: "/settings/connections", group: "Settings", icon: Link2 },

    // Pages
    { title: "FAQs", url: "/faqs", group: "Pages", icon: HelpCircle },
    { title: "Pricing", url: "/pricing", group: "Pages", icon: CreditCard },

    // Quick Actions
    {
      title: "Set Theme to Dark",
      action: () => {
        setTheme("dark")
        toast.success("Theme changed to Dark")
      },
      group: "Actions",
      icon: Moon
    },
    {
      title: "Set Theme to Light",
      action: () => {
        setTheme("light")
        toast.success("Theme changed to Light")
      },
      group: "Actions",
      icon: Sun
    },
    {
      title: "Set Theme to System",
      action: () => {
        setTheme("system")
        toast.success("Theme changed to System Preference")
      },
      group: "Actions",
      icon: Laptop
    },
  ]

  // Add Sign Out if authenticated
  if (isAuthenticated) {
    searchItems.push({
      title: "Sign Out",
      action: () => {
        logout()
        toast.success("Logged out successfully!")
        navigate("/auth/sign-in")
      },
      group: "Actions",
      icon: LogOut
    })
  }

  // Dynamic resource indexing
  const indexedTasks: SearchItem[] = tasks.map((t) => ({
    title: `Task: ${t.title} [${t.id}]`,
    url: "/tasks",
    group: "Search Results (Tasks)",
    icon: CheckSquare,
  }))

  const indexedMails: SearchItem[] = mails.slice(0, 5).map((m) => ({
    title: `Mail: ${m.subject} (from ${m.name})`,
    url: "/mail",
    group: "Search Results (Mails)",
    icon: Mail,
  }))

  const allSearchItems = [...searchItems, ...indexedTasks, ...indexedMails]

  const groupedItems = allSearchItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = []
    }
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
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-none md:border border-input bg-transparent md:bg-background shadow-none md:shadow-xs hover:bg-accent hover:text-accent-foreground h-9 w-9 md:w-36 lg:w-56 justify-center md:justify-start px-2 py-1 md:px-3 text-muted-foreground cursor-pointer relative"
    >
      <Search className="size-4 shrink-0" />
      <span className="hidden md:inline-flex text-xs">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium opacity-100 lg:flex">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  )
}
