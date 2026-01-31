import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
};