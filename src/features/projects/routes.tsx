import { type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProjectPageLoader } from './components/ProjectPageLoader';

// Lazy load project pages
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProjectEditPage = lazy(() => import('./pages/ProjectEditPage'));
const ProjectCreatePage = lazy(() => import('./pages/ProjectCreatePage'));

export const projectsRoutes: RouteObject[] = [
  {
    path: 'projects',
    children: [
      {
        index: true,
        element: (
          <Suspense fallback= { <ProjectPageLoader /> } >
            <ProjectsPage />
          </Suspense>
        )
      },
      {
        path: ':projectId',
        element: (
          <Suspense fallback={<ProjectPageLoader />}>
            <ProjectDetailPage />
          </Suspense>
        ),
      },
      {
        path: ':projectId/edit',
        element: (
          <Suspense fallback={<ProjectPageLoader />}>
            <ProjectEditPage />
          </Suspense>
        ),
      },
      {
        path: 'new',
        element: (
          <Suspense fallback={<ProjectPageLoader />}>
            <ProjectCreatePage />
          </Suspense>
        ),
      },
    ],
  },
];