import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Login from "@/features/auth/pages/Login";
import NotFound from "@/app/routes/NotFound";
import { RequireAuth } from "@/app/routes/RequireAuth";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import { contactsRoutes } from '@/features/contacts/routes';
import { tasksRoutes } from '@/features/tasks/routes';
import { projectsRoutes } from "@/features/projects/routes";
import { purchasesRoutes } from '@/features/purchases/routes';
import { vendorsRoutes } from '@/features/vendors/routes';
import { usersRoutes } from '@/features/users/routes';
import { settingsRoutes } from '@/features/settings/routes';



const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const ClientDetailPage = lazy(() => import("@/features/clients/pages/ClientDetailPage"));
const ClientsPage = lazy(() => import("@/features/clients/pages/ClientsPage"));
const ClientCreatePage = lazy(() => import("@/features/clients/pages/ClientCreatePage"));
const ClientEditPage = lazy(() => import("@/features/clients/pages/ClientEditPage"));
const OpportunitiesPage = lazy(() => import("@/features/opportunity/pages/OpportunitiesPage"));
//Quotes
const QuotesPage = lazy(() => import("@/features/quotes/pages/QuotesPage"));
const QuoteDetailPage = lazy(() => import("@/features/quotes/pages/QuoteDetailPage"));
const QuoteCreatePage = lazy(() => import("@/features/quotes/pages/QuoteCreatePage"));
const QuoteEditPage = lazy(() => import("@/features/quotes/pages/QuoteEditPage"));

// Opportunities
const OpportunityDetailPage = lazy(() => import("@/features/opportunity/pages/OpportunityDetailPage"));
const OpportunityCreatePage = lazy(() => import("@/features/opportunity/pages/OpportunityCreatePage"));
const OpportunityEditPage = lazy(() => import("@/features/opportunity/pages/OpportunityEditPage"));
const TaskListPage = lazy(() => import("@/features/tasks/pages/TaskListPage"));
const TaskCreatePage = lazy(() => import("@/features/tasks/pages/TaskCreatePage"));
const TaskDetailPage = lazy(() => import("@/features/tasks/pages/TaskDetailPage"));
const CommentDetailPage = lazy(() => import("@/features/comments/pages/ComentDetailPage"));
// Contacts



const basePath = import.meta.env.VITE_BASE_PATH || '/';


export const router = createBrowserRouter([
  // Rutas públicas
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Login />,
  },

  // Rutas protegidas
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // CRM Modules - todas protegidas

      {
        path: "clients",
        element: <ClientsPage />,

      },
      { path: "clients/:id", element: <ClientDetailPage /> },
      { path: "clients/new", element: <ClientCreatePage /> },
      { path: "clients/:id/edit", element: <ClientEditPage /> },
      { path: "comments/:id", element: <CommentDetailPage /> },
      { path: "opportunities", element: <OpportunitiesPage /> },
      { path: "opportunities/new", element: <OpportunityCreatePage /> },
      { path: "opportunities/:id", element: <OpportunityDetailPage /> },
      { path: "opportunities/:id/edit", element: <OpportunityEditPage /> },
      { path: "quotes", element: <QuotesPage /> },
      { path: "quotes/:quoteId", element: <QuoteDetailPage /> },
      { path: "quotes/new", element: <QuoteCreatePage /> },
      { path: "quotes/:quoteId/edit", element: <QuoteEditPage /> },
      ...projectsRoutes,
      { path: "tasks", element: <TaskListPage /> },
      { path: "tasks/new", element: <TaskCreatePage /> },
      { path: "tasks/:taskId", element: <TaskDetailPage /> },
      ...contactsRoutes,
      ...tasksRoutes,
      ...purchasesRoutes,
      ...vendorsRoutes,
      ...usersRoutes,
      ...settingsRoutes,

    ],

  },

  // Ruta 404
  {
    path: "*",
    element: <NotFound />,
  },
],
  { basename: basePath }
);