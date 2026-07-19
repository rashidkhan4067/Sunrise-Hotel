import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_USER, type UserProfile } from "@/config/site-config"

export interface HotelInfo {
  hotelName: string
  phone: string
  email: string
  address: string
  starRating: string
  currency: string
  taxRate: number
  checkInTime: string
  checkOutTime: string
  gracePeriod: number
}

export interface Preferences {
  defaultCheckoutStatus: string
  autoAssignRooms: boolean
  cancellationPolicy: string
  emailAlerts: boolean
  appAlerts: boolean
  autoCleanupAlerts: boolean
}

const DEFAULT_HOTEL_INFO: HotelInfo = {
  hotelName: "Sunrise Hotel & Suites",
  phone: "+92 300 1234567",
  email: "info@sunrisehotel.com",
  address: "123 Sunset Boulevard, Sector G-11, Islamabad, Pakistan",
  starRating: "5",
  currency: "PKR",
  taxRate: 16,
  checkInTime: "14:00",
  checkOutTime: "12:00",
  gracePeriod: 60,
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultCheckoutStatus: "dirty",
  autoAssignRooms: true,
  cancellationPolicy: "24h",
  emailAlerts: true,
  appAlerts: true,
  autoCleanupAlerts: false,
}

interface DashboardLayout {
  cards: boolean
  chart: boolean
  table: boolean
}

interface AppState {
  notificationsEnabled: boolean
  toggleNotifications: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  user: UserProfile
  updateUser: (profile: Partial<UserProfile>) => void
  dashboardLayout: DashboardLayout
  setDashboardLayout: (layout: Partial<DashboardLayout>) => void
  hotelInfo: HotelInfo
  updateHotelInfo: (info: Partial<HotelInfo>) => void
  preferences: Preferences
  updatePreferences: (prefs: Partial<Preferences>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      user: DEFAULT_USER,
      updateUser: (profile) => set((state) => ({ user: { ...state.user, ...profile } })),
      dashboardLayout: {
        cards: true,
        chart: true,
        table: true,
      },
      setDashboardLayout: (layout) =>
        set((state) => ({
          dashboardLayout: { ...state.dashboardLayout, ...layout },
        })),
      hotelInfo: DEFAULT_HOTEL_INFO,
      updateHotelInfo: (info) => set((state) => ({ hotelInfo: { ...state.hotelInfo, ...info } })),
      preferences: DEFAULT_PREFERENCES,
      updatePreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
    }),
    {
      name: "app-store",
    }
  )
)

