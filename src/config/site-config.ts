import {
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
  LayoutTemplate,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  target?: string
  items?: {
    title: string
    url: string
  }[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const BRAND_CONFIG = {
  name: "Admin Portal",
  subName: "Admin Dashboard",
  logoSize: 24,
  landingPageUrl: "/landing",
}

export interface UserProfile {
  name: string
  email: string
  avatar: string
}

export const DEFAULT_USER: UserProfile = {
  name: "Rashid Khan",
  email: "rashid@example.com",
  avatar: "",
}

export const STORAGE_KEYS = {
  theme: "vite-ui-theme",
  sidebarConfig: "sidebar-ui-config",
  authSession: "auth-session",
  themeCustomizer: "theme-customizer-config",
}

export const navGroups: NavGroup[] = [
  {
    label: "Dashboards",
    items: [
      {
        title: "Dashboard 1",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Dashboard 2",
        url: "/dashboard-2",
        icon: LayoutPanelLeft,
      },
    ],
  },
  {
    label: "Apps",
    items: [
      {
        title: "Mail",
        url: "/mail",
        icon: Mail,
      },
      {
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare,
      },
      {
        title: "Chat",
        url: "/chat",
        icon: MessageCircle,
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
    ],
  },
  {
    label: "Pages",
    items: [
      {
        title: "Landing",
        url: "/landing",
        target: "_blank",
        icon: LayoutTemplate,
      },
      {
        title: "Auth Pages",
        url: "#",
        icon: Shield,
        items: [
          { title: "Sign In", url: "/auth/sign-in" },
          { title: "Sign Up", url: "/auth/sign-up" },
          { title: "Forgot Password 1", url: "/auth/forgot-password" },
          { title: "Forgot Password 2", url: "/auth/forgot-password-2" },
          { title: "Forgot Password 3", url: "/auth/forgot-password-3" },
        ],
      },
      {
        title: "Errors",
        url: "#",
        icon: AlertTriangle,
        items: [
          { title: "Unauthorized", url: "/errors/unauthorized" },
          { title: "Forbidden", url: "/errors/forbidden" },
          { title: "Not Found", url: "/errors/not-found" },
          { title: "Internal Server Error", url: "/errors/internal-server-error" },
          { title: "Under Maintenance", url: "/errors/under-maintenance" },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings,
        items: [
          { title: "User Settings", url: "/settings/user" },
          { title: "Account Settings", url: "/settings/account" },
          { title: "Plans & Billing", url: "/settings/billing" },
          { title: "Appearance", url: "/settings/appearance" },
          { title: "Notifications", url: "/settings/notifications" },
          { title: "Connections", url: "/settings/connections" },
        ],
      },
      {
        title: "FAQs",
        url: "/faqs",
        icon: HelpCircle,
      },
      {
        title: "Pricing",
        url: "/pricing",
        icon: CreditCard,
      },
    ],
  },
]
