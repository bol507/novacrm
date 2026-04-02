import { useEffect, useState, useMemo } from "react";
import { authService } from "@/features/auth/services/auth-service";
import type { AuthResponse } from "@/features/auth/types/auth";

/**
 * Hook for managing authentication and current user state.
 *
 * Provides the authenticated user, login/logout functions, and helpers
 * for role and permission verification.
 *
 * @returns Object containing user, loading state, and auth methods
 *
 * @example
 * // Basic usage
 * const { user, loading, login, logout } = useAuth();
 *
 * if (loading) return <Spinner />;
 * if (!user) return <LoginPage />;
 *
 * return <div>Welcome, {user.name}</div>;
 *
 * @example
 * // With role checking
 * const { isAdmin, hasRole } = useAuth();
 *
 * if (isAdmin) {
 *   // Show admin panel
 * }
 *
 * if (hasRole('Usuario')) {
 *   // Show user dashboard
 * }
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  /**
   * Logs in a user with credentials.
   *
   * @param credentials - User credentials containing username and password
   * @returns Promise resolving to authentication response data
   *
   * @example
   * await login({ user_name: 'john', password: 'secret' });
   */
  const login = async (credentials: { user_name: string; password: string }) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  /**
   * Logs out the current user.
   *
   * @returns Promise that resolves when logout is complete
   *
   * @example
   * await logout();
   * navigate('/login');
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  /**
   * Whether the current user has admin role.
   */
  const isAdmin = useMemo(() => {
    return user?.role === 'Admin';
  }, [user]);

  /**
   * Checks if the current user has a specific role.
   *
   * @param role - Role to check ('Admin', 'Usuario', 'Cliente')
   * @returns True if the user has the specified role
   */
  const hasRole = (role: 'Admin' | 'Usuario' | 'Cliente') => {
    return user?.role === role;
  };

  return { 
    user, 
    loading, 
    login, 
    logout,
    isAdmin,      
    hasRole,      
  };
};

/**
 * Helper hook to check if the current user is an administrator.
 *
 * @returns True if the user has 'Admin' role
 *
 * @example
 * const isAdmin = useIsAdmin();
 * if (isAdmin) {
 *   // Show admin options
 * }
 */
export const useIsAdmin = (): boolean => {
  const { isAdmin } = useAuth();
  return isAdmin;
};

/**
 * Helper hook to check if the current user has a specific role.
 *
 * @param role - Role to check ('Admin', 'Usuario', 'Cliente')
 * @returns True if the user has the specified role
 *
 * @example
 * const isAdmin = useHasRole('Admin');
 * const isClient = useHasRole('Cliente');
 *
 * if (isAdmin) {
 *   // Admin content
 * } else if (isClient) {
 *   // Client content
 * }
 */
export const useHasRole = (role: 'Admin' | 'Usuario' | 'Cliente'): boolean => {
  const { hasRole } = useAuth();
  return hasRole(role);
};