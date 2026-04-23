// src/features/settings/routes.ts

import { type RouteObject, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * Loader component for settings pages.
 * Displays a centered loading spinner while lazy-loaded components are being fetched.
 */
const SettingsPageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Lazy-loaded settings pages (combined Roles & Profiles)
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/**
 * Settings routes configuration.
 *
 * Defines routes for system administration:
 * - Combined Roles & Profiles management (with internal tabs)
 *
 * Route structure:
 * - /dashboard/settings/roles → Main settings page (tabs: "Roles" | "Profiles")
 *
 * @example
 * // In your main router configuration:
 * import { settingsRoutes } from '@/features/settings/routes';
 *
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
 *     children: [
 *       ...settingsRoutes,
 *       ...otherFeatureRoutes
 *     ]
 *   }
 * ];
 */
export const settingsRoutes: RouteObject[] = [
  {
    path: 'settings',
    children: [
      {
        // GET /dashboard/settings/roles → Combined Roles & Profiles page
        path: 'roles',
        element: (
          <Suspense fallback={<SettingsPageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        // GET /dashboard/settings → Redirect to roles tab by default
        index: true,
        element: <Navigate to="roles" replace />,
      },
    ],
  },
];