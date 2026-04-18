import { Button } from "@/components/ui/button";
import { ShieldAlertIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Unauthorized = () => {
    const navigate = useNavigate();
    return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <ShieldAlertIcon className="h-16 w-16 text-destructive mb-4" />
    <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
    <p className="text-muted-foreground mb-6">
      No tienes permisos para acceder a esta sección.
    </p>
    <Button onClick={() => navigate("/dashboard")}>
      Volver al Dashboard
    </Button>
  </div>
);
}