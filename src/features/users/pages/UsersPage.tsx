import { useState, useEffect, useMemo } from "react";
import type { User, UserViewMode } from "@/features/users/types/user";
import { useUsers } from "@/features/users/hooks/use-users";
import { useDeleteUser } from "../hooks/use-delete-user";
import { UserView } from "../components/UserView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/Pagination";
import { useConfirm } from "@/components/confirm-dialog";

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
  const navigate = useNavigate();
  const showConfirm = useConfirm();
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

  const { data, isLoading, error, refetch } = useUsers({ page, perPage: 20, search: searchTerm });
  const deleteUserMutation = useDeleteUser();

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredUsers = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;




  const handleCreateClick = () => navigate("/dashboard/settings/users/new");


  const handleEditUser = (user: User) => navigate(`/dashboard/settings/users/${user.id}/edit`);

  const handleViewUser = (user: User) => {
    navigate(`/dashboard/settings/users/${user.id}`);
  };

  /*const handleChangePassword = (user: User) => {
    setPasswordUserId(user.id);
  };*/
  const handleChangePassword = (user: User) => {

    navigate(`/dashboard/settings/users/${user.id}/password`);
  };


  const handleDeleteUser = async (user: User) => {
    

    showConfirm({
      title: "Delete User",
      description: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone and the user will no longer be able to log in.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteUserMutation.mutateAsync(user.id);
          
        } catch {
          // error handled in useDeleteUser hook
        }
      },
      onCancel: () => {
        // Do nothing
        console.log('Delete cancelled for user:', user.id);
      },
    });
  };


  const handleViewModeChange = (mode: UserViewMode) => {
    setViewMode(mode);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <UserView
        users={filteredUsers}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={handleCreateClick}
        onViewModeChange={handleViewModeChange}
        onRefresh={refetch}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onChangePassword={handleChangePassword}
        viewMode={viewMode}
        totalItems={totalItems}

      />


      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="justify-end"
        showFirstLast={true}
      />
    </ErrorBoundary>
  );
};

export default UsersPage;