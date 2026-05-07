import { useEffect, useState, useMemo, useCallback } from "react";
import { authService } from "@/features/auth/services/auth-service";
import type { UserData } from "@/features/auth/types/auth";

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
  const [user, setUser] = useState<UserData | null>(null);
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
    setUser(data.user.data);
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
   * Whether the current user has system administrator privileges.
   * Checks the `is_admin` flag (not hierarchical role).
   */
  const isAdmin = useMemo(() => {
    return user?.is_admin === true;
  }, [user]);

  /**
   * Checks if the current user has a specific hierarchical role.
   *
   * @param roleId - Vtiger role ID to check (e.g., 'H1', 'H2', 'H8')
   * @returns True if the user has the specified hierarchical role
   *
   * @example
   * if (hasHierarchicalRole('H2')) {
   *   // User has CEO role
   * }
   */
  const hasHierarchicalRole = useCallback((roleId: string): boolean => {
    return user?.role_id === roleId;
  }, [user]);

  /**
   * Checks if the current user has one of multiple hierarchical roles.
   *
   * @param roleIds - Array of Vtiger role IDs to check
   * @returns True if the user has any of the specified roles
   *
   * @example
   * if (hasAnyHierarchicalRole(['H1', 'H2'])) {
   *   // User is Organization or CEO
   * }
   */
  const hasAnyHierarchicalRole = useCallback((roleIds: string[]): boolean => {
    return user?.role_id ? roleIds.includes(user.role_id) : false;
  }, [user]);

  /**
   * Get the readable role name for display purposes.
   */
  const roleName = useMemo(() => {
    return user?.rolename ?? null;
  }, [user]);

  /**
 * Checks if the current user has a specific role by its readable name.
 * Useful when you prefer business-readable names over hierarchical IDs.
 *
 * @param roleNames - Array of role names to check (e.g., ['Admin', 'Producción', 'Compras'])
 * @returns True if user's rolename matches any in the list OR if is_admin=true
 */
  const hasRoleByName = useCallback((roleNames: string[]): boolean => {
    if (user?.is_admin) return true;
    return user?.rolename ? roleNames.includes(user.rolename) : false;
  }, [user]);

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
    hasHierarchicalRole,
    hasAnyHierarchicalRole,
    roleName,
    hasRoleByName,
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

;

/**
 * Helper hook to check if the current user has a specific hierarchical role.
 *
 * @param roleId - Vtiger role ID to check (e.g., 'H2' for CEO)
 * @returns True if the user has the specified hierarchical role
 *
 * @example
 * const isCEO = useHasHierarchicalRole('H2');
 * const isSales = useHasHierarchicalRole('H8');
 *
 * if (isCEO) {
 *   // CEO content
 * } else if (isSales) {
 *   // Sales content
 * }
 */
export const useHasHierarchicalRole = (roleId: string): boolean => {
  const { hasHierarchicalRole } = useAuth();
  return hasHierarchicalRole(roleId);
};

/**
 * Helper hook to check if the current user has any of multiple hierarchical roles.
 *
 * @param roleIds - Array of Vtiger role IDs to check
 * @returns True if the user has any of the specified roles
 *
 * @example
 * const isExecutive = useHasAnyHierarchicalRole(['H1', 'H2', 'H3']);
 * 
 * if (isExecutive) {
 *   // Show executive dashboard
 * }
 */
export const useHasAnyHierarchicalRole = (roleIds: string[]): boolean => {
  const { hasAnyHierarchicalRole } = useAuth();
  return hasAnyHierarchicalRole(roleIds);
};