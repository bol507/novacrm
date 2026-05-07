// src/features/procurements/routes.tsx

import { type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * Loader component for settings pages.
 * Displays a centered loading spinner while lazy-loaded components are being fetched.
 */
const LoaderPage = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const MaterialRequestDetailContainer = lazy(() => import('./components/containers/MaterialRequestDetailContainer'));
const CreateRFQContainer = lazy(() => import('./components/containers/CreateRFQContainer'));
const VendorQuoteListContainer = lazy(() => import('./components/containers/VendorQuoteListContainer'));
const VendorQuoteDetailContainer = lazy(() => import('./components/containers/VendorQuoteDetailContainer'));

export const procurementsRoutes: RouteObject[] = [
  {
    path: 'projects/:projectId/procurement',
    children: [
      {
        
        path: ':requestId',
        element: (
          <Suspense fallback={<LoaderPage />}>
            <MaterialRequestDetailContainer />
          </Suspense>
        ),
      },
      {
        path: 'create-rfq',
        element: (
          <Suspense fallback={<LoaderPage />}>
            <CreateRFQContainer />
          </Suspense>
        ),
      },
      {
        path: 'vendor-quotes',
        element: (
          <Suspense fallback={<LoaderPage />}>
            <VendorQuoteListContainer />
          </Suspense>
        ),
      },
      {
        path: 'vendor-quotes/:quoteId',
        element: (
          <Suspense fallback={<LoaderPage />}>
            <VendorQuoteDetailContainer />
          </Suspense>
        ),
      }
      
     
    ],

  },
];
