import { useEffect, useState, useMemo } from "react";
import { authService } from "@/features/auth/services/auth-service";
import type { AuthResponse } from "@/features/auth/types/auth";

/**
 * Hook para gestionar autenticación y usuario actual
 * 
 * Proporciona el usuario autenticado, funciones de login/logout,
 * y helpers para verificación de roles y permisos.
 * 
 * @returns Objecto con usuario, estado de carga, y métodos de auth
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

  const login = async (credentials: { user_name: string; password: string }) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  
  const isAdmin = useMemo(() => {
    return user?.role === 'Admin';
  }, [user]);

  
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
 * Hook helper para verificar si el usuario actual es administrador
 * 
 * @returns boolean True si el usuario tiene role 'Admin'
 * 
 * @example
 * const isAdmin = useIsAdmin();
 * if (isAdmin) {
 *   // Mostrar opciones de administrador
 * }
 */
export const useIsAdmin = (): boolean => {
  const { isAdmin } = useAuth();
  return isAdmin;
};

/**
 * Hook helper para verificar si el usuario tiene un rol específico
 * 
 * @param role Rol a verificar ('Admin', 'Usuario', 'Cliente')
 * @returns boolean True si el usuario tiene el rol especificado
 * 
 * @example
 * const isAdmin = useHasRole('Admin');
 * const isClient = useHasRole('Cliente');
 */
export const useHasRole = (role: 'Admin' | 'Usuario' | 'Cliente'): boolean => {
  const { hasRole } = useAuth();
  return hasRole(role);
};