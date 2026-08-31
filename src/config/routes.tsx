import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminRoute } from '@/components/admin-route'
import { StaffRoute } from '@/components/staff-route'
import { GuestRoute } from '@/components/guest-route'
import { ProtectedRoute } from '@/components/router/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { RouteProgress } from '@/components/route-progress'

// Resilient dynamic module importer with auto-retry and cache-refresh on deployment updates
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (error: any) {
      console.warn("Dynamic import failed (stale deployment chunk), refreshing page...", error)
      const pageKey = "chunk_retry_" + window.location.pathname
      const hasRetried = sessionStorage.getItem(pageKey)
      if (!hasRetried) {
        sessionStorage.setItem(pageKey, "true")
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      sessionStorage.removeItem(pageKey)
      throw error
    }
  })
}

// ─── Admin Pages ───────────────────────────────────────────────
const Dashboard = lazyWithRetry(() => import('@/app/admin/dashboard/page'))
const Reports = lazyWithRetry(() => import('@/app/admin/reports/page'))
const Calendar = lazyWithRetry(() => import('@/app/admin/calendar/page'))
const Users = lazyWithRetry(() => import('@/app/admin/users/page'))
const Rooms = lazyWithRetry(() => import('@/app/admin/rooms/page'))
const RoomDetail = lazyWithRetry(() => import('@/app/admin/rooms/detail-page'))
const Bookings = lazyWithRetry(() => import('@/app/admin/bookings/page'))
const Guests = lazyWithRetry(() => import('@/app/admin/guests/page'))

// ─── Receptionist Pages ─────────────────────────────────────────
const ReceptionistDashboard = lazyWithRetry(() => import('@/app/receptionist/dashboard/page'))
const ReceptionistCalendar = lazyWithRetry(() => import('@/app/receptionist/calendar/page'))
const ReceptionistRooms = lazyWithRetry(() => import('@/app/receptionist/rooms/page'))
const ReceptionistRoomDetail = lazyWithRetry(() => import('@/app/receptionist/rooms/detail-page'))
const ReceptionistBookings = lazyWithRetry(() => import('@/app/receptionist/bookings/page'))
const ReceptionistGuests = lazyWithRetry(() => import('@/app/receptionist/guests/page'))

// ─── Settings Pages ────────────────────────────────────────────
const HotelSettings = lazyWithRetry(() => import('@/app/admin/settings/hotel/page'))
const UserSettings = lazyWithRetry(() => import('@/app/admin/settings/user/page'))
const PasswordSettings = lazyWithRetry(() => import('@/app/admin/settings/password/page'))

// ─── Auth Pages (utility routes — not sidebar items) ───────────
const SignIn = lazyWithRetry(() => import('@/app/auth/sign-in/page'))
const SignUp = lazyWithRetry(() => import('@/app/auth/sign-up/page'))
const ForgotPassword = lazyWithRetry(() => import('@/app/auth/forgot-password/page'))
const SSOCallback = lazyWithRetry(() => import('@/app/auth/sso-callback/page'))

// ─── Error Pages (utility routes — not sidebar items) ──────────
const Unauthorized = lazyWithRetry(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazyWithRetry(() => import('@/app/errors/forbidden/page'))
const NotFound = lazyWithRetry(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazyWithRetry(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazyWithRetry(() => import('@/app/errors/under-maintenance/page'))

// ─── Guest Pages ───────────────────────────────────────────────
const GuestDashboard = lazyWithRetry(() => import('@/app/guest/dashboard/page'))
const GuestBookings = lazyWithRetry(() => import('@/app/guest/bookings/page'))

// ─── Support & Live Help Desk ──────────────────────────────────
const AdminSupport = lazyWithRetry(() => import('@/app/admin/support/page'))
const GuestSupport = lazyWithRetry(() => import('@/app/guest/support/page'))

// ─── Landing Page ──────────────────────────────────────────────
const LandingPage = lazyWithRetry(() => import('@/components/landing').then(m => ({ default: m.LandingPage })))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}

// Smart redirect at root path based on auth state
function RootRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) {
    return <RouteProgress />
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  if (role === "org:admin") {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (role === "receptionist") {
    return <Navigate to="/receptionist/dashboard" replace />
  }
  return <Navigate to="/guest/dashboard" replace />
}

export const routes: RouteConfig[] = [
  // Root path
  {
    path: "/",
    element: <RootRedirect />
  },
  {
    path: "/landing",
    element: <LandingPage />
  },

  // ─── Admin: Hotel Modules ───────────────────────────────────
  {
    path: "/admin/dashboard",
    element: <AdminRoute><Dashboard /></AdminRoute>
  },
  {
    path: "/admin/reports",
    element: <AdminRoute><Reports /></AdminRoute>
  },
  {
    path: "/admin/bookings",
    element: <AdminRoute><Bookings /></AdminRoute>
  },
  {
    path: "/admin/calendar",
    element: <AdminRoute><Calendar /></AdminRoute>
  },
  {
    path: "/admin/rooms",
    element: <AdminRoute><Rooms /></AdminRoute>
  },
  {
    path: "/admin/rooms/:id",
    element: <AdminRoute><RoomDetail /></AdminRoute>
  },
  {
    path: "/admin/guests",
    element: <AdminRoute><Guests /></AdminRoute>
  },
  {
    path: "/admin/users",
    element: <AdminRoute><Users /></AdminRoute>
  },

  // ─── Admin: Settings ────────────────────────────────────────
  {
    path: "/admin/support",
    element: <AdminRoute><AdminSupport /></AdminRoute>
  },
  {
    path: "/admin/settings/hotel",
    element: <AdminRoute><HotelSettings /></AdminRoute>
  },
  {
    path: "/admin/settings/user",
    element: <ProtectedRoute><UserSettings /></ProtectedRoute>
  },
  {
    path: "/admin/settings/password",
    element: <AdminRoute><PasswordSettings /></AdminRoute>
  },

  // ─── Receptionist Portal ─────────────────────────────────────
  {
    path: "/receptionist/dashboard",
    element: <StaffRoute><ReceptionistDashboard /></StaffRoute>
  },
  {
    path: "/receptionist/bookings",
    element: <StaffRoute><ReceptionistBookings /></StaffRoute>
  },
  {
    path: "/receptionist/calendar",
    element: <StaffRoute><ReceptionistCalendar /></StaffRoute>
  },
  {
    path: "/receptionist/rooms",
    element: <StaffRoute><ReceptionistRooms /></StaffRoute>
  },
  {
    path: "/receptionist/rooms/:id",
    element: <StaffRoute><ReceptionistRoomDetail /></StaffRoute>
  },
  {
    path: "/receptionist/guests",
    element: <StaffRoute><ReceptionistGuests /></StaffRoute>
  },
  {
    path: "/receptionist/support",
    element: <StaffRoute><AdminSupport /></StaffRoute>
  },
  {
    path: "/receptionist/settings/user",
    element: <ProtectedRoute><UserSettings /></ProtectedRoute>
  },
  {
    path: "/receptionist/settings/password",
    element: <ProtectedRoute><PasswordSettings /></ProtectedRoute>
  },

  // ─── Guest Portal ───────────────────────────────────────────
  {
    path: "/guest/dashboard",
    element: <GuestRoute><GuestDashboard /></GuestRoute>
  },
  {
    path: "/guest/bookings",
    element: <GuestRoute><GuestBookings /></GuestRoute>
  },
  {
    path: "/guest/support",
    element: <GuestRoute><GuestSupport /></GuestRoute>
  },
  {
    path: "/guest/settings/user",
    element: <GuestRoute><UserSettings /></GuestRoute>
  },
  {
    path: "/guest/settings/password",
    element: <GuestRoute><PasswordSettings /></GuestRoute>
  },

  // ─── Auth (utility routes) ───────────────────────────────────
  {
    path: "/auth/sign-in",
    element: <SignIn />
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/sso-callback",
    element: <SSOCallback />
  },

  // ─── Error Pages (utility routes) ────────────────────────────
  {
    path: "/errors/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/errors/forbidden",
    element: <Forbidden />
  },
  {
    path: "/errors/not-found",
    element: <NotFound />
  },
  {
    path: "/errors/internal-server-error",
    element: <InternalServerError />
  },
  {
    path: "/errors/under-maintenance",
    element: <UnderMaintenance />
  },

  // ─── 404 catch-all ───────────────────────────────────────────
  {
    path: "*",
    element: <NotFound />
  }
]
