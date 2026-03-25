import { useState, useEffect, useMemo } from "react";
import type { User, UserViewMode } from "@/features/users/types/user";
import { useUsers } from "@/features/users/hooks/use-users";
import { useDeleteUser } from "../hooks/use-delete-user";
import { userService } from "@/features/users/services/user-service";
import { toast } from "sonner";
import UserFormDialog from "@/features/users/components/UserFormDialog";
import { UserDetailDialog } from "../components/UserDetailDialog";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import { UserView } from "../components/UserView";

/**
 * UsersPage component for managing system users.
 *
 * Features:
 * - Displays paginated list of users with search functionality
 * - Supports card and table view modes (persisted in localStorage)
 * - Create, edit, view, change password, and delete user operations
 * - Responsive layout with proper loading and error states
 * - Dialog modals for user forms, details, and password changes
 *
 * @component
 * @returns The rendered users management page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/users" element={<UsersPage />} />
 */
const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<UserViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("usersViewMode") as UserViewMode) || "cards";
    }
    return "cards";
  });

  // Persist view mode preference to localStorage
  useMemo(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("usersViewMode", viewMode);
    }
  }, [viewMode]);

  const { data, isLoading, error, refetch } = useUsers(page, 20, searchTerm);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const deleteUserMutation = useDeleteUser();

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredUsers = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  /**
   * Handles user creation form submission.
   *
   * @param userData - The user data to create
   */
  const handleCreateUser = async (userData: any) => {
    try {
      await userService.createUser(userData);
      await refetch();
      toast.success("User created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating user");
    }
  };

  /**
   * Opens the edit dialog for a user.
   *
   * @param user - The user to edit
   */
  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  /**
   * Handles user update form submission.
   *
   * @param userData - The updated user data
   */
  const handleUpdateUser = async (userData: any) => {
    try {
      await userService.updateUserProfile(editingUser!.id, userData);
      setEditingUser(null);
      await refetch();
      toast.success("User updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating user");
    }
  };

  /**
   * Opens the view dialog for a user.
   *
   * @param user - The user to view
   */
  const handleViewUser = (user: User) => {
    setViewingUser(user);
  };

  /**
   * Opens the change password dialog for a user.
   *
   * @param user - The user whose password to change
   */
  const handleChangePassword = (user: User) => {
    setPasswordUserId(user.id);
  };

  /**
   * Handles user deletion with confirmation.
   *
   * @param user - The user to delete
   */
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user ${user.first_name} ${user.last_name}?`)) {
      return;
    }
    try {
      await deleteUserMutation.mutateAsync(user.id);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  /**
   * Handles view mode changes (cards/table).
   *
   * @param mode - The new view mode
   */
  const handleViewModeChange = (mode: UserViewMode) => {
    setViewMode(mode);
  };

  return (
    <>
      <UserView
        users={filteredUsers}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={() => setIsCreateDialogOpen(true)}
        onViewModeChange={handleViewModeChange}
        onRefresh={refetch}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onChangePassword={handleChangePassword}
        viewMode={viewMode}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

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
    </>
  );
};

export default UsersPage;