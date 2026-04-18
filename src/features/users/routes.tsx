import { type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RequireAdmin } from '@/app/routes/RequireAdmin';

/**
 * Loader component for user pages.
 * Displays a centered loading spinner while lazy-loaded components are being fetched.
 *
 * @returns Loading spinner component
 */
const UserPageLoader = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
);

// Lazy-loaded user pages for optimal performance
const UsersPage = lazy(() => import('./pages/UsersPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const UserEditPage = lazy(() => import('./pages/UserEditPage'));
const UserCreatePage = lazy(() => import('./pages/UserCreatePage'));

/**
 * User routes configuration.
 *
 * Defines all routes related to user management (Admin only):
 * - List view (index) → /dashboard/settings/users
 * - Create view (new) → /dashboard/settings/users/new
 * - Detail view (:userId) → /dashboard/settings/users/:userId
 * - Edit view (:userId/edit) → /dashboard/settings/users/:userId/edit
 *
 * IMPORTANT: Static routes ('new') are placed BEFORE dynamic routes (':userId')
 * to prevent React Router from incorrectly matching "new" as a user ID.
 *
 * All routes use lazy loading with Suspense for optimal performance and
 * reduced initial bundle size. The UserPageLoader provides a consistent
 * loading experience across all user pages.
 *
 * @example
 * // In your main App.tsx routes:
 * import { usersRoutes } from '@/features/users/routes/usersRoutes';
 *
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
 *     children: [
 *       ...usersRoutes,  // ← Requires RequireAdmin wrapper in index.tsx
 *       ...clientsRoutes,
 *       ...projectsRoutes
 *     ]
 *   }
 * ];
 *
 * @security
 * These routes should be wrapped with <RequireAdmin> in the main router
 * to ensure only administrators can access user management features.
 */
export const usersRoutes: RouteObject[] = [
    {
        path: "settings/users",

        children: [
            {
                index: true,
                element: (
                    <RequireAdmin>
                        <Suspense fallback={<UserPageLoader />}>
                            <UsersPage />
                        </Suspense>
                    </RequireAdmin>
                ),
            },
            {
                path: "new",
                element: (
                    <RequireAdmin>
                        <Suspense fallback={<UserPageLoader />}>
                            <UserCreatePage />
                        </Suspense>
                    </RequireAdmin>
                ),
            },
            {
                path: ":userId",
                element: (
                    <RequireAdmin>
                        <Suspense fallback={<UserPageLoader />}>
                            <UserDetailPage />
                        </Suspense>
                    </RequireAdmin>
                ),
            },
            {
                path: ":userId/edit",
                element: (
                    <RequireAdmin>
                        <Suspense fallback={<UserPageLoader />}>
                            <UserEditPage />
                        </Suspense>
                    </RequireAdmin>
                ),
            },
        ],
    }
];