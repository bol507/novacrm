import { useMemo } from "react";
import { Loader2,  UserIcon } from "lucide-react";
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
  
  // ✅ Cargar usuarios con tu hook actual
  const { 
    data: usersData,      // ✅ Tipo: PaginatedResponse<User> | undefined
    isLoading: usersLoading, 
    error 
  } = useUsers(
    1,      // page
    100,    // perPage (cargar suficientes para el selector)
    ''      // search
  );

  // ✅ Extraer usuarios del response paginado
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
            .filter((u: User) => u.id !== currentUserId)
            .map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.first_name} {user.last_name}
                {user.role === 'Admin' && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Admin)
                  </span>
                )}
              </SelectItem>
            ))}
          
          {/* Empty state */}
          {users.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No hay usuarios activos disponibles
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