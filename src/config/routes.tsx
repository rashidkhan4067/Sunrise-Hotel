import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminRoute } from '@/components/admin-route'
import { ProtectedRoute } from '@/components/router/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { RouteProgress } from '@/components/route-progress'

// ─── Admin Pages ───────────────────────────────────────────────
const Dashboard = lazy(() => import('@/app/admin/dashboard/page'))
const Reports = lazy(() => import('@/app/admin/reports/page'))
const Calendar = lazy(() => import('@/app/admin/calendar/page'))
const Users = lazy(() => import('@/app/admin/users/page'))
const Rooms = lazy(() => import('@/app/admin/rooms/page'))
const RoomDetail = lazy(() => import('@/app/admin/rooms/detail-page'))
const Bookings = lazy(() => import('@/app/admin/bookings/page'))
const Guests = lazy(() => import('@/app/admin/guests/page'))

// ─── Settings Pages ────────────────────────────────────────────
const HotelSettings = lazy(() => import('@/app/admin/settings/hotel/page'))
const UserSettings = lazy(() => import('@/app/admin/settings/user/page'))
const PasswordSettings = lazy(() => import('@/app/admin/settings/password/page'))
const PreferencesSettings = lazy(() => import('@/app/admin/settings/preferences/page'))

// ─── Auth Pages (utility routes — not sidebar items) ───────────
const SignIn = lazy(() => import('@/app/auth/sign-in/page'))
const SignUp = lazy(() => import('@/app/auth/sign-up/page'))
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'))
const SSOCallback = lazy(() => import('@/app/auth/sso-callback/page'))

// ─── Error Pages (utility routes — not sidebar items) ──────────
const Unauthorized = lazy(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazy(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazy(() => import('@/app/errors/under-maintenance/page'))

// ─── Guest Pages ───────────────────────────────────────────────
const GuestDashboard = lazy(() => import('@/app/guest/dashboard/page'))
const GuestBookings = lazy(() => import('@/app/guest/bookings/page'))

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
    return <Navigate to="/auth/sign-in" replace />
  }

  return <Navigate to={role === "org:admin" ? "/admin/dashboard" : "/guest/dashboard"} replace />
}

export const routes: RouteConfig[] = [
  // Root redirect
  {
    path: "/",
    element: <RootRedirect />
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
    path: "/admin/settings/hotel",
    element: <ProtectedRoute><HotelSettings /></ProtectedRoute>
  },
  {
    path: "/admin/settings/user",
    element: <ProtectedRoute><UserSettings /></ProtectedRoute>
  },
  {
    path: "/admin/settings/password",
    element: <ProtectedRoute><PasswordSettings /></ProtectedRoute>
  },
  {
    path: "/admin/settings/preferences",
    element: <ProtectedRoute><PreferencesSettings /></ProtectedRoute>
  },

  // ─── Guest Portal ───────────────────────────────────────────
  {
    path: "/guest/dashboard",
    element: <ProtectedRoute><GuestDashboard /></ProtectedRoute>
  },
  {
    path: "/guest/bookings",
    element: <ProtectedRoute><GuestBookings /></ProtectedRoute>
  },
  {
    path: "/guest/settings/user",
    element: <ProtectedRoute><UserSettings /></ProtectedRoute>
  },
  {
    path: "/guest/settings/password",
    element: <ProtectedRoute><PasswordSettings /></ProtectedRoute>
  },
  {
    path: "/guest/settings/preferences",
    element: <ProtectedRoute><PreferencesSettings /></ProtectedRoute>
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
