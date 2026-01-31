import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Login from "@/app/pages/auth/Login";
import Dashboard from "@/app/pages/dashboard/Dashboard";
import { RequireAuth } from "@/app/routes/RequireAuth";
import NotFound from "@/app/pages/NotFound"; 
import DashboardLayout from "../layouts/DashboardLayout";
const ClientDetailPage = lazy(() => import("@/app/pages/clients/ClientDetailPage"));
const ClientPage = lazy(() => import("@/app/pages/clients/ClientsPage"));

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
        element: <ClientPage />,
         
      },
      { path: "clients/:id", element: <ClientDetailPage /> },
      
      /*

      {
        path: "opportunities",
        lazy: () => import("@/app/pages/opportunities/OpportunitiesPage"),
      },
      {
        path: "quotes",
        lazy: () => import("@/app/pages/quotes/QuotesPage"),
      },
      {
        path: "orders",
        lazy: () => import("@/app/pages/orders/OrdersPage"),
      },
      {
        path: "invoices",
        lazy: () => import("@/app/pages/invoices/InvoicesPage"),
      },
      {
        path: "campaigns",
        lazy: () => import("@/app/pages/campaigns/CampaignsPage"),
      },
      {
        path: "leads",
        lazy: () => import("@/app/pages/leads/LeadsPage"),
      },
      {
        path: "products",
        lazy: () => import("@/app/pages/products/ProductsPage"),
      },
      {
        path: "reports",
        lazy: () => import("@/app/pages/reports/ReportsPage"),
      },
      {
        path: "calendar",
        lazy: () => import("@/app/pages/calendar/CalendarPage"),
      },
      {
        path: "settings",
        lazy: () => import("@/app/pages/settings/SettingsPage"),
      },*/
    ],
  },

  // Ruta 404
  {
    path: "*",
    element: <NotFound />,
  },
]);