import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  User as UserIcon,
  Shield
} from "lucide-react";
import type { User } from "../types/user";

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Nunca';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  return status === "Active"
    ? "bg-green-500/10 text-green-600 border-green-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";
};

export const UserDetailDialog = ({ user, open, onOpenChange }: UserDetailDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {user.first_name} {user.last_name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">@{user.user_name}</p>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(user.status)}>
              {user.status === "Active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{user.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Apellido</p>
                <p className="font-medium">{user.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuario</p>
                <p className="font-medium">@{user.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium flex items-center gap-2">
                  {user.role}
                  {user.role === 'Admin' && <Shield className="h-4 w-4 text-amber-500" />}
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contacto
            </h3>
            <div className="space-y-2">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone_crm && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone_crm}</span>
                </div>
              )}
            </div>
          </div>

          {/* Departamento */}
          {(user.department || user.reports_to_id) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organización
              </h3>
              <div className="space-y-2">
                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{user.department}</span>
                  </div>
                )}
                {user.reports_to_id && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Reporta a: ID {user.reports_to_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fecha de creación (si la tienes en tu API) */}
          {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Creado el: {formatDate(user.created_at)}</span>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};