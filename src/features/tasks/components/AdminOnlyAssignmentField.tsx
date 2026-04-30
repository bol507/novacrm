import { useMemo } from "react";
import {  Loader2, UserIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsAdmin } from "@/features/auth/hooks/use-auth";
import { useUsers } from "@/features/users/hooks/use-users";
import type { User } from "@/features/users/types/user";
import { Badge } from "@/components/ui/badge";

interface AdminOnlyAssignmentFieldProps {
  currentUserId?: number;
  value?: number;
  onChange: (userId: number) => void;
  disabled?: boolean;
}

export default function AdminOnlyAssignmentField({
  currentUserId,
  value,
  onChange,
  disabled,
}: AdminOnlyAssignmentFieldProps) {
  const isAdmin = useIsAdmin();


  const {
    data: usersData,
    isLoading: usersLoading,
    error
  } = useUsers({
    page: 1,
    perPage: 100,
    search: ''
  });


  const users = useMemo(() => {
    // usersData.data es el array de usuarios
    const allUsers = usersData?.data || [];
    // Filtrar solo usuarios activos
    return allUsers.filter((u: User) => u.is_active);
  }, [usersData]);

  // Si no es admin, no renderizar el campo
  if (!isAdmin) {
    return null;
  }

  // Obtener nombre para display
  const selectedUserName = useMemo(() => {
    if (!value) return "Seleccionar usuario";
    if (value === currentUserId) return "Tú (Usuario actual)";
    const user = users.find((u: User) => u.id === value);
    return user ? `${user.first_name} ${user.last_name}` : "Usuario no encontrado";
  }, [value, currentUserId, users]);

  if (usersLoading) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Asignado a
        </Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando usuarios...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Asignado a
        </Label>
        <div className="text-sm text-destructive">
          Error cargando usuarios. Por favor intenta nuevamente.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="assigned_user_id" className="flex items-center gap-2">
        <UserIcon className="w-4 h-4" />
        Asignado a
      </Label>

      <Select
        value={value?.toString() || ""}
        onValueChange={(val) => onChange(parseInt(val))}
        disabled={disabled || usersLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={selectedUserName} />
        </SelectTrigger>
        <SelectContent>
          {/* Option: assign to self */}
          {currentUserId && (
            <SelectItem value={currentUserId.toString()}>
              Tú (Usuario actual)
            </SelectItem>
          )}

          {/* Divider */}
          {currentUserId && users.length > 0 && (
            <div className="my-1 border-t" />
          )}

          {/* List of other active users */}
          {users
            .filter((u: User) => u.id !== currentUserId && u.is_active) // ✅ También filtrar por is_active
            .map((user) => (
              <SelectItem
                key={user.id}
                value={user.id.toString()}
                className="flex items-center justify-between gap-2" // ✅ Alinear contenido
              >
                {/* Nombre del usuario */}
                <span className="flex-1 truncate">
                  {user.first_name} {user.last_name}
                </span>

                {/* Badges de referencia (derecha) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* ✅ Badge de Admin (system flag) - corregido */}
                  {user.is_admin && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-500/10 text-purple-700 text-[10px] px-1 py-0 h-auto"
                    >
                      Admin
                    </Badge>
                  )}

                  {/* ✅ Rol jerárquico (opcional, para contexto adicional) */}
                  {user.rolename && !user.is_admin && (
                    <span className="text-[10px] text-muted-foreground">
                      {user.rolename}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}


          {/* Empty state */}
          {users.filter((u: User) => u.id !== currentUserId && u.is_active).length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No other active users available
            </div>
          )}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        {value === currentUserId
          ? "La tarea se asignará a ti"
          : "Selecciona el usuario que realizará esta tarea"}
      </p>
    </div>
  );
}