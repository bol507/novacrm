import { useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import type { AuthResponse } from "@/features/auth/types/auth";

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

  return { user, loading, login, logout };
};