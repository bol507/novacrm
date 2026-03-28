import { type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ContactPageLoader } from './components/ContactPageLoader';


const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const ContactDetailPage = lazy(() => import('./pages/ContactDetailPage'));
const ContactCreatePage = lazy(() => import('./pages/ContactCreatePage'));
const ContactEditPage = lazy(() => import('./pages/ContactEditPage'));

export const contactsRoutes: RouteObject[] = [
  {
    path: 'contacts',
    children: [
      { 
        index: true, 
        element: (
          <Suspense fallback={<ContactPageLoader />}>
            <ContactsPage />
          </Suspense>
        )
      },
      { 
        path: ':contactId', 
        element: (
          <Suspense fallback={<ContactPageLoader />}>
            <ContactDetailPage />
          </Suspense>
        )
      },
      { 
        path: ':contactId/edit', 
        element: (
          <Suspense fallback={<ContactPageLoader />}>
            <ContactEditPage />
          </Suspense>
        )
      },
      { 
        path: 'create', 
        element: (
          <Suspense fallback={<ContactPageLoader />}>
            <ContactCreatePage />
          </Suspense>
        )
      },
    ],
  },
];