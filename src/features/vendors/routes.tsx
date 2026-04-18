// src/features/vendors/routes/vendorsRoutes.ts

import { type RouteObject, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * Loader component for vendor pages.
 * Displays a centered loading spinner while lazy-loaded components are being fetched.
 *
 * @returns Loading spinner component
 */
const VendorPageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Lazy-loaded vendor pages for optimal performance
const VendorListPage = lazy(() => import('./pages/VendorListPage'));
const VendorDetailPage = lazy(() => import('./pages/VendorDetailPage'));
const VendorEditPage = lazy(() => import('./pages/VendorEditPage'));
const VendorCreatePage = lazy(() => import('./pages/VendorCreatePage'));

/**
 * Vendor routes configuration.
 *
 * Defines all routes related to vendor (supplier) management:
 * - List view (index)
 * - Create view (create)
 * - Detail view (:vendorId)
 * - Edit view (:vendorId/edit)
 *
 * IMPORTANT: Static routes ('create') are placed BEFORE dynamic routes (':vendorId')
 * to prevent React Router from incorrectly matching "create" as a vendor ID.
 *
 * @example
 * // In your main router configuration:
 * import { vendorsRoutes } from '@/features/vendors/routes/vendorsRoutes';
 *
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
 *     children: [
 *       ...vendorsRoutes,
 *       ...purchasesRoutes,
 *       ...projectsRoutes
 *     ]
 *   }
 * ];
 */
export const vendorsRoutes: RouteObject[] = [
  {
    path: 'vendors',
    children: [
      {
        // GET /dashboard/vendors
        index: true,
        element: (
          <Suspense fallback={<VendorPageLoader />}>
            <VendorListPage />
          </Suspense>
        ),
      },
      {
        // GET /dashboard/vendors/create (Static route FIRST)
        path: 'create',
        element: (
          <Suspense fallback={<VendorPageLoader />}>
            <VendorCreatePage />
          </Suspense>
        ),
      },
      {
        // GET /dashboard/vendors/new → Redirect to /create
        path: 'new',
        element: <Navigate to="create" replace />,
      },
      {
        // GET /dashboard/vendors/:vendorId (Dynamic route LAST)
        path: ':vendorId',
        element: (
          <Suspense fallback={<VendorPageLoader />}>
            <VendorDetailPage />
          </Suspense>
        ),
      },
      {
        // GET /dashboard/vendors/:vendorId/edit
        path: ':vendorId/edit',
        element: (
          <Suspense fallback={<VendorPageLoader />}>
            <VendorEditPage />
          </Suspense>
        ),
      },
    ],
  },
];