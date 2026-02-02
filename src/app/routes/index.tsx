import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Login from "@/features/auth/pages/Login";
import NotFound from "@/app/routes/NotFound"; 
import { RequireAuth } from "@/app/routes/RequireAuth";
import DashboardLayout from "@/shared/layouts/DashboardLayout";



const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const ClientDetailPage = lazy(() => import("@/features/clients/pages/ClientDetailPage"));
const ClientPage = lazy(() => import("@/features/clients/pages/ClientsPage"));
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage"));

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
      { path: "users", element: <UsersPage /> },
      
    ],
  },

  // Ruta 404
  {
    path: "*",
    element: <NotFound />,
  },
]);