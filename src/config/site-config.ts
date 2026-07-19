import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Bed,
  Contact,
  Users,
  BarChart3,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  target?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

// ─── Brand Configuration ────────────────────────────────────────

export const BRAND_CONFIG = {
  admin: {
    name: "SunRise Hotel",
    subName: "Management Console",
    logoSize: 24,
  },
  guest: {
    name: "SunRise Hotel",
    subName: "Guest Portal",
    logoSize: 24,
  },
}

// ─── User Profile ───────────────────────────────────────────────

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

// ─── Storage Keys ───────────────────────────────────────────────

export const STORAGE_KEYS = {
  theme: "vite-ui-theme",
  sidebarConfig: "sidebar-ui-config",
  authSession: "auth-session",
  themeCustomizer: "theme-customizer-config",
}

// ─── Admin Navigation (Full Access) ────────────────────────────
//
// Admin sees all hotel modules plus system management.
// Flat structure — no nested menus for MVP.

export const adminNavGroups: NavGroup[] = [
  {
    label: "Hotel",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Bookings",
        url: "/admin/bookings",
        icon: ClipboardList,
      },
      {
        title: "Booking Calendar",
        url: "/admin/calendar",
        icon: CalendarDays,
      },
      {
        title: "Rooms",
        url: "/admin/rooms",
        icon: Bed,
      },
      {
        title: "Guests",
        url: "/admin/guests",
        icon: Contact,
      },
      {
        title: "Staff",
        url: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Reports",
        url: "/admin/reports",
        icon: BarChart3,
      },
      {
        title: "Settings",
        url: "/admin/settings/hotel",
        icon: Settings,
      },
    ],
  },
]

// ─── Receptionist Navigation (Restricted Access) ────────────────
//
// Receptionists can manage day-to-day operations:
// check-ins, check-outs, room status, guest lookup.
// They do NOT see Staff management, Reports, or Settings.

export const receptionistNavGroups: NavGroup[] = [
  {
    label: "Hotel",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Bookings",
        url: "/admin/bookings",
        icon: ClipboardList,
      },
      {
        title: "Booking Calendar",
        url: "/admin/calendar",
        icon: CalendarDays,
      },
      {
        title: "Rooms",
        url: "/admin/rooms",
        icon: Bed,
      },
      {
        title: "Guests",
        url: "/admin/guests",
        icon: Contact,
      },
    ],
  },
]

// ─── Guest Navigation ──────────────────────────────────────────
//
// Guest portal — separate product, separate nav.
// Do not reuse the admin sidebar for guest users.

export const guestNavGroups: NavGroup[] = [
  {
    label: "My Stay",
    items: [
      {
        title: "Dashboard",
        url: "/guest/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Reservations",
        url: "/guest/bookings",
        icon: ClipboardList,
      },
      {
        title: "My Profile",
        url: "/guest/settings/user",
        icon: User,
      },
    ],
  },
]
