import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";

interface RequireAdminProps {
  children: ReactNode;
}

/**
 * RequireAdmin Component
 *
 * A route guard that restricts access to users with system administrator privileges.
 * Checks the `is_admin` flag (not hierarchical role) to determine access.
 *
 * Features:
 * - Checks authentication status before rendering
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated non-admin users to /dashboard with error toast
 * - Shows loading spinner while checking authentication
 *
 * @component
 * @param props - Component props
 * @param props.children - Child components to render only if user has is_admin=true
 * @returns The rendered route guard component
 *
 * @example
 * // Wrap admin routes in router configuration
 * <Route
 *   path="/dashboard/settings/users"
 *   element={
 *     <RequireAdmin>
 *       <UsersPage />
 *     </RequireAdmin>
 *   }
 * />
 */
export const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      } 
      if (user.is_admin !== true) {
        toast.error("Access denied: System administrator permissions required");
        navigate("/dashboard", { replace: true });
        return;
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user?.is_admin === true ? <>{children}</> : null;
};