/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as VerifyOtpImport } from './routes/verifyOtp'
import { Route as LoginImport } from './routes/login'
import { Route as DashboardRouteImport } from './routes/dashboard/route'
import { Route as DashboardFeedRouteImport } from './routes/dashboard/feed/route'
import { Route as DashboardEntryRouteImport } from './routes/dashboard/entry/route'

// Create/Update Routes

const VerifyOtpRoute = VerifyOtpImport.update({
  path: '/verifyOtp',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const DashboardRouteRoute = DashboardRouteImport.update({
  path: '/dashboard',
  getParentRoute: () => rootRoute,
} as any)

const DashboardFeedRouteRoute = DashboardFeedRouteImport.update({
  path: '/feed',
  getParentRoute: () => DashboardRouteRoute,
} as any)

const DashboardEntryRouteRoute = DashboardEntryRouteImport.update({
  path: '/entry',
  getParentRoute: () => DashboardRouteRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/verifyOtp': {
      id: '/verifyOtp'
      path: '/verifyOtp'
      fullPath: '/verifyOtp'
      preLoaderRoute: typeof VerifyOtpImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/entry': {
      id: '/dashboard/entry'
      path: '/entry'
      fullPath: '/dashboard/entry'
      preLoaderRoute: typeof DashboardEntryRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/feed': {
      id: '/dashboard/feed'
      path: '/feed'
      fullPath: '/dashboard/feed'
      preLoaderRoute: typeof DashboardFeedRouteImport
      parentRoute: typeof DashboardRouteImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  DashboardRouteRoute: DashboardRouteRoute.addChildren({
    DashboardEntryRouteRoute,
    DashboardFeedRouteRoute,
  }),
  LoginRoute,
  VerifyOtpRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/dashboard",
        "/login",
        "/verifyOtp"
      ]
    },
    "/dashboard": {
      "filePath": "dashboard/route.tsx",
      "children": [
        "/dashboard/entry",
        "/dashboard/feed"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/verifyOtp": {
      "filePath": "verifyOtp.tsx"
    },
    "/dashboard/entry": {
      "filePath": "dashboard/entry/route.tsx",
      "parent": "/dashboard"
    },
    "/dashboard/feed": {
      "filePath": "dashboard/feed/route.tsx",
      "parent": "/dashboard"
    }
  }
}
ROUTE_MANIFEST_END */
