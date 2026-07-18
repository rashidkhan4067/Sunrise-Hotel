"use client"

import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes'
import { RouteProgress } from '@/components/route-progress'
import { ProtectedRoute } from './protected-route'

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/sso-callback",
  "/errors/unauthorized",
  "/errors/forbidden",
  "/errors/not-found",
  "/errors/internal-server-error",
  "/errors/under-maintenance",
]

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => {
    // Check if the path is explicitly public
    const isPublic = PUBLIC_PATHS.includes(route.path) || route.path === "/"

    const element = isPublic ? (
      route.element
    ) : (
      <ProtectedRoute>{route.element}</ProtectedRoute>
    )

    return (
      <Route
        key={route.path + index}
        path={route.path}
        element={
          <Suspense fallback={<RouteProgress />}>
            {element}
          </Suspense>
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    )
  })
}

export function AppRouter() {
  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  )
}
