import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import type { User } from "@/features/users/types/user";
import { UserCards } from "@/features/users/components/UserCards";
import { useUsers } from "@/features/users/hooks/use-users";
import { useDeleteUser } from "../hooks/use-delete-user";
import { userService } from "@/features/users/services/user-service";
import { toast } from "sonner";
import UserFormDialog from "@/features/users/components/UserFormDialog";
import { UserDetailDialog } from "../components/UserDetailDialog";
import ChangePasswordDialog from "../components/ChangePasswordDialog";



const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useUsers(page, 20, searchTerm);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredUsers = data?.data || [];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error al cargar usuarios: {error.message}</p>
        </div>
      </div>
    );
  }

  const handleUserClick = (user: User) => {
    console.log("Ver detalles de usuario:", user);
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await userService.createUser(userData);
      await refetch();
      toast.success("Usuario creado exitosamente");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear usuario");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      await userService.updateUserProfile(editingUser!.id, userData);
      setEditingUser(null);
      await refetch();
      toast.success("Usuario actualizado exitosamente");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar usuario");
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
  };

  const handleChangePassword = (user: User) => {
    setPasswordUserId(user.id);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${user.first_name} ${user.last_name}?`)) {
      return;
    }
    
    try {
      await deleteUserMutation.mutateAsync(user.id);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <UserCards
        users={filteredUsers}
        isLoading={isLoading}
        onUserClick={handleViewUser}
        onEditUser={handleEditUser}
        onChangePassword={handleChangePassword}
        onDeleteUser={handleDeleteUser}
      />

      {/* Footer info */}
      {!isLoading && data && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {data.meta.total} usuarios
        </div>
      )}

      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUser}
        mode="create"
      />

      {editingUser && (
        <UserFormDialog
          open={true}
          onOpenChange={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
          mode="edit"
          initialData={editingUser}
        />
      )}


      <UserDetailDialog
        user={viewingUser}
        open={!!viewingUser}
        onOpenChange={() => setViewingUser(null)}
      />

      {passwordUserId && (
        <ChangePasswordDialog
          userId={passwordUserId}
          open={true}
          onOpenChange={() => setPasswordUserId(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;