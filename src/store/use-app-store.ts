import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_USER, type UserProfile } from "@/config/site-config"
import type { CalendarEvent } from "@/app/admin/calendar/types"

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
  calendarEvents: CalendarEvent[]
  initializeCalendarEvents: (events: CalendarEvent[]) => void
  addCalendarEvent: (event: CalendarEvent) => void
  updateCalendarEvent: (event: CalendarEvent) => void
  deleteCalendarEvent: (id: number) => void
  dashboardLayout: DashboardLayout
  setDashboardLayout: (layout: Partial<DashboardLayout>) => void
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
      calendarEvents: [],
      initializeCalendarEvents: (events) => set({ calendarEvents: events }),
      addCalendarEvent: (event) => set((state) => ({ calendarEvents: [event, ...state.calendarEvents] })),
      updateCalendarEvent: (event) =>
        set((state) => ({
          calendarEvents: state.calendarEvents.map((e) => (e.id === event.id ? event : e)),
        })),
      deleteCalendarEvent: (id) =>
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
        })),
      dashboardLayout: {
        cards: true,
        chart: true,
        table: true,
      },
      setDashboardLayout: (layout) =>
        set((state) => ({
          dashboardLayout: { ...state.dashboardLayout, ...layout },
        })),
    }),
    {
      name: "app-store",
    }
  )
)
