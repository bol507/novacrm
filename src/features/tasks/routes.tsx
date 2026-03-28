import { type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * Loader component for task pages.
 * Displays a centered loading spinner while lazy-loaded components are being fetched.
 *
 * @returns Loading spinner component
 */
const TaskPageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Lazy-loaded task pages for optimal performance
const TaskListPage = lazy(() => import('./pages/TaskListPage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
const TaskEditPage = lazy(() => import('./pages/TaskEditPage'));
const TaskCreatePage = lazy(() => import('./pages/TaskCreatePage'));

/**
 * Task routes configuration.
 *
 * Defines all routes related to task management:
 * - List view (index)
 * - Detail view (:taskId)
 * - Edit view (:taskId/edit)
 * - Create view (create)
 *
 * All routes use lazy loading with Suspense for optimal performance and
 * reduced initial bundle size. The TaskPageLoader provides a consistent
 * loading experience across all task pages.
 *
 * @example
 * // In your main App.tsx routes:
 * import { tasksRoutes } from '@/features/tasks/routes/tasksRoutes';
 *
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <DashboardLayout />,
 *     children: tasksRoutes
 *   }
 * ];
 *
 * @example
 * // With additional routes
 * const routes: RouteObject[] = [
 *   {
 *     path: '/dashboard',
 *     element: <DashboardLayout />,
 *     children: [
 *       ...tasksRoutes,
 *       ...clientsRoutes,
 *       ...projectsRoutes
 *     ]
 *   }
 * ];
 */
export const tasksRoutes: RouteObject[] = [
  {
    path: 'tasks',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<TaskPageLoader />}>
            <TaskListPage />
          </Suspense>
        ),
      },
      {
        path: ':taskId',
        element: (
          <Suspense fallback={<TaskPageLoader />}>
            <TaskDetailPage />
          </Suspense>
        ),
      },
      {
        path: ':taskId/edit',
        element: (
          <Suspense fallback={<TaskPageLoader />}>
            <TaskEditPage />
          </Suspense>
        ),
      },
      {
        path: 'create',
        element: (
          <Suspense fallback={<TaskPageLoader />}>
            <TaskCreatePage />
          </Suspense>
        ),
      },
    ],
  },
];