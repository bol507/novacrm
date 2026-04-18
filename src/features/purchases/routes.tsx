import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

/**
 * Loader component for purchase pages.
 * Displays a centered loading spinner while lazy-loaded components are being fetched.
 *
 * @returns Loading spinner component
 */
const PurchasePageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Lazy-loaded purchase pages for optimal performance
const PurchaseListPage = lazy(() => import('./pages/PurchaseListPage'));
const PurchaseDetailPage = lazy(() => import('./pages/PurchaseDetailPage'));
const PurchaseEditPage = lazy(() => import('./pages/PurchaseEditPage'));
const PurchaseCreatePage = lazy(() => import('./pages/PurchaseCreatePage'));

/**
 * Purchase routes configuration.
 *
 * Defines all routes related to purchase order management:
 * - List view (index) - All purchases with pagination and filters
 * - Detail view (:purchaseId) - Full purchase order details with items
 * - Edit view (:purchaseId/edit) - Edit existing purchase order
 * - Create view (create) - Create new purchase order
 *
 * All routes use lazy loading with Suspense for optimal performance and
 * reduced initial bundle size. The PurchasePageLoader provides a consistent
 * loading experience across all purchase pages.
 *
 * @example
 * // In your main App.tsx routes:
 * import { purchasesRoutes } from '@/features/purchases/routes/purchasesRoutes';
 *
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <DashboardLayout />,
 *     children: purchasesRoutes
 *   }
 * ];
 *
 * @example
 * // With additional feature routes
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <DashboardLayout />,
 *     children: [
 *       ...purchasesRoutes,
 *       ...quotesRoutes,
 *       ...projectsRoutes,
 *       ...clientsRoutes
 *     ]
 *   }
 * ];
 */
export const purchasesRoutes: RouteObject[] = [
  {
    path: 'purchases',
    children: [
      // 1️⃣ Index primero
      {
        index: true,
        element: (
          <Suspense fallback={<PurchasePageLoader />}>
            <PurchaseListPage />
          </Suspense>
        ),
      },
      // 2️⃣ Rutas estáticas (ANTES de :purchaseId)
      {
        // ✅ REDIRECT: /new → /create (para soportar ambos)
        path: 'new',
        element: <Navigate to="create" replace />,
      },
      {
        // ✅ Ruta principal de creación
        path: 'create',
        element: (
          <Suspense fallback={<PurchasePageLoader />}>
            <PurchaseCreatePage />
          </Suspense>
        ),
      },
      // 3️⃣ Rutas dinámicas con sufijo
      {
        path: ':purchaseId/edit',
        element: (
          <Suspense fallback={<PurchasePageLoader />}>
            <PurchaseEditPage />
          </Suspense>
        ),
      },
      // 4️⃣ Ruta dinámica genérica (SIEMPRE AL FINAL)
      {
        path: ':purchaseId',
        element: (
          <Suspense fallback={<PurchasePageLoader />}>
            <PurchaseDetailPage />
          </Suspense>
        ),
      },
    ],
  },
];