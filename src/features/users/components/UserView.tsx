import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, LayoutGrid, List,  } from "lucide-react";
import type { User, UserViewMode } from "../types/user";
import { UserCards } from "./UserCards";
import { UserTable } from "./UserTable";

export interface UserViewProps {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onViewModeChange: (mode: UserViewMode) => void;
  onRefresh: () => void;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  viewMode: UserViewMode;
  totalItems: number;

}





/**
 * UserView component - Main presentational component for the users page.
 *
 * Features:
 * - Displays users in either card or table view mode
 * - Search functionality with filter input
 * - Create, edit, view, delete, and change password actions
 * - Pagination controls via ListFooter
 * - Error state handling with retry button
 * - Loading states for async operations
 *
 * @component
 * @param props - Component props
 * @param props.users - Array of users to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.error - Error object if data fetching failed
 * @param props.searchTerm - Current search term value
 * @param props.onSearchChange - Callback for search input changes
 * @param props.onCreateClick - Callback for create user action
 * @param props.onViewModeChange - Callback for view mode toggle
 * @param props.onRefresh - Callback for refresh action
 * @param props.onView - Callback for viewing user details
 * @param props.onEdit - Callback for editing a user
 * @param props.onDelete - Callback for deleting a user
 * @param props.onChangePassword - Callback for changing user password
 * @param props.viewMode - Current view mode ('cards' or 'table')
 * @param props.page - Current page number
 * @param props.totalPages - Total number of pages
 * @param props.totalItems - Total number of items across all pages
 * @param props.onPageChange - Callback for page changes
 * @returns The rendered user view component
 */
export const UserView = ({
  users,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onViewModeChange,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  onChangePassword,
  viewMode,
  totalItems
 
}: UserViewProps) => {
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading users: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalItems}
            </Badge>
            Users
          </h1>
          <p className="text-muted-foreground">
            Manage system users
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <div className="flex rounded-md border border-border overflow-hidden">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("cards")}
              className="rounded-none border-r border-border"
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("table")}
              className="rounded-none"
              title="Table view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button className="gap-2" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            New User
          </Button>
        </div>
      </div>
      {/*}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search users"
          />
        </div>
      </div>
        */}
      {viewMode === "cards" ? (
        <UserCards
          users={users}
          isLoading={isLoading}
          onUserClick={onView!}
          onEditUser={onEdit}
          onChangePassword={onChangePassword}
          onDeleteUser={onDelete}
        />
      ) : (
        <UserTable
          users={users}
          isLoading={isLoading}
          searchValue={searchTerm}
          onSearchChange={onSearchChange}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangePassword={onChangePassword}
          onRefresh={onRefresh}
        />
      )}

      
    </div>
  );
};










export default UserView;
