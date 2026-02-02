import { useAuth } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types/auth";
import { createContext, useContext } from "react";

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  },
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};