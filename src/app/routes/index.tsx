import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Login from "@/features/auth/pages/Login";
import NotFound from "@/app/routes/NotFound"; 
import { RequireAuth } from "@/app/routes/RequireAuth";
import DashboardLayout from "@/shared/layouts/DashboardLayout";



const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const ClientDetailPage = lazy(() => import("@/features/clients/pages/ClientDetailPage"));
const ClientsPage = lazy(() => import("@/features/clients/pages/ClientsPage")); 
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage"));
const OpportunitiesPage = lazy(() => import("@/features/opportunity/pages/OpportunitiesPage"));
const QuotesPage = lazy(() => import("@/features/quotes/pages/QuotesPage"));
const QuoteDetailPage = lazy(() => import("@/features/quotes/pages/QuoteDetailPage"));

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
      { path: "users", element: <UsersPage /> },
      { path: "opportunities", element: <OpportunitiesPage />}, 
      { path: "quotes", element: <QuotesPage />},
      { path: "quotes/:quoteId", element: <QuoteDetailPage  />},
      
    ],
  },

  // Ruta 404
  {
    path: "*",
    element: <NotFound />,
  },
]);