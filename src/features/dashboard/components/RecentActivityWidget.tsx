import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  MessageSquare,
  Phone 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const activities = [
  {
    id: 1,
    type: "new_client",
    icon: UserPlus,
    title: "Nuevo cliente registrado",
    description: "TechSolutions Inc. fue agregado",
    time: "Hace 5 min",
    user: "María García",
    color: "text-accent bg-accent/10",
  },
  {
    id: 2,
    type: "quote",
    icon: FileText,
    title: "Cotización enviada",
    description: "Propuesta #COT-2024-156",
    time: "Hace 25 min",
    user: "Carlos López",
    color: "text-primary bg-primary/10",
  },
  {
    id: 3,
    type: "sale",
    icon: DollarSign,
    title: "Venta cerrada",
    description: "$15,800 - Proyecto Enterprise",
    time: "Hace 1 hora",
    user: "Ana Martínez",
    color: "text-accent bg-accent/10",
  },
  {
    id: 4,
    type: "call",
    icon: Phone,
    title: "Llamada realizada",
    description: "Seguimiento a cliente ABC",
    time: "Hace 2 horas",
    user: "Pedro Ruiz",
    color: "text-info bg-info/10",
  },
  {
    id: 5,
    type: "task",
    icon: CheckCircle,
    title: "Tarea completada",
    description: "Revisión de propuesta comercial",
    time: "Hace 3 horas",
    user: "Laura Sánchez",
    color: "text-accent bg-accent/10",
  },
];

const RecentActivityWidget = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 group"
            >
              <div
                className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  activity.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.user}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;