import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  FileText,
  Phone,
  Mail,
  Calendar,
  Package,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const actions = [
  {
    id: 1,
    name: "Nuevo Cliente",
    icon: UserPlus,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
    path: "/clients/new",
  },
  {
    id: 2,
    name: "Nueva Cotización",
    icon: FileText,
    color: "bg-accent/10 text-accent hover:bg-accent/20",
    path: "/quotes/new",
  },
  {
    id: 3,
    name: "Registrar Llamada",
    icon: Phone,
    color: "bg-info/10 text-info hover:bg-info/20",
    path: "/calls/new",
  },
  {
    id: 4,
    name: "Enviar Email",
    icon: Mail,
    color: "bg-warning/10 text-warning hover:bg-warning/20",
    path: "/emails/compose",
  },
  {
    id: 5,
    name: "Agendar Reunión",
    icon: Calendar,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
    path: "/calendar/new",
  },
  {
    id: 6,
    name: "Nuevo Producto",
    icon: Package,
    color: "bg-accent/10 text-accent hover:bg-accent/20",
    path: "/products/new",
  },
  {
    id: 7,
    name: "Nueva Oportunidad",
    icon: Target,
    color: "bg-info/10 text-info hover:bg-info/20",
    path: "/opportunities/new",
  },
  {
    id: 8,
    name: "Ver Reportes",
    icon: BarChart3,
    color: "bg-warning/10 text-warning hover:bg-warning/20",
    path: "/reports",
  },
];

const QuickActionsWidget = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={cn(
                  "h-auto flex-col gap-2 py-4 px-3 transition-all",
                  action.color
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.name}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;