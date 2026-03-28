import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, LayoutGrid, List, Mail, Phone, Building2 } from "lucide-react";
import type { User, UserViewMode } from "../types/user";
import ListFooter from "@/components/ListFooter";

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
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

/**
 * Returns status badge color classes based on user status.
 *
 * @param status - The user status string
 * @returns Tailwind CSS classes for the status badge
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'Inactive':
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    case 'Pending':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

/**
 * Returns role badge color classes based on user role.
 *
 * @param role - The user role string
 * @returns Tailwind CSS classes for the role badge
 */
const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'Usuario':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Cliente':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

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
  page,
  totalPages,
  totalItems,
  onPageChange,
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

      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={users.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="users"
        className="mt-6"
      />
    </div>
  );
};

import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield } from "lucide-react";

interface UserCardsProps {
  users: User[];
  isLoading: boolean;
  onUserClick: (user: User) => void;
  onEditUser?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
}

/**
 * UserCards component for displaying users in a responsive card grid.
 *
 * Features:
 * - Skeleton loading state
 * - Empty state when no users found
 * - Dropdown menu for edit, change password, and delete actions
 * - Clickable cards for viewing user details
 * - Displays user information including name, username, email, phone, department, role, and status
 *
 * @component
 * @param props - Component props
 * @param props.users - Array of users to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.onUserClick - Callback for viewing user details
 * @param props.onEditUser - Callback for editing a user
 * @param props.onChangePassword - Callback for changing user password
 * @param props.onDeleteUser - Callback for deleting a user
 * @returns The rendered user cards component
 */
const UserCards = ({
  users,
  isLoading,
  onUserClick,
  onEditUser,
  onChangePassword,
  onDeleteUser,
}: UserCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onUserClick(user)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                <p className="text-sm text-muted-foreground">@{user.user_name}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditUser && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditUser(user); }}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onChangePassword && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangePassword(user); }}>
                      Change password
                    </DropdownMenuItem>
                  )}
                  {onDeleteUser && (
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteUser(user); }}>
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{user.email || '-'}</span>
              </div>
              {user.phone_crm && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone_crm}</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{user.department}</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Badge variant="outline" className={getRoleColor(user.role)}>
                {user.role}
              </Badge>
              <Badge variant="outline" className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

import { useMemo } from 'react';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Skeleton loader for the user table.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Skeleton loading placeholders
 */
const UserTableSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
    ))}
  </div>
);

/**
 * Mobile card view for a single user in the table view.
 *
 * @param props - Component props
 * @param props.user - User object to display
 * @param props.onView - Callback for viewing user details
 * @param props.onEdit - Callback for editing a user
 * @param props.onDelete - Callback for deleting a user
 * @param props.onChangePassword - Callback for changing user password
 * @returns Mobile user card component
 */
const UserTableCard = ({
  user,
  onView,
}: {
  user: User;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChangePassword?: (user: User) => void;
}) => (
  <div 
    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
    onClick={() => onView?.(user)}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold truncate">{user.first_name} {user.last_name}</span>
        <span className="text-xs text-muted-foreground">@{user.user_name}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {user.email || 'No email'}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={getRoleColor(user.role)}>
        {user.role}
      </Badge>
      <Badge variant="outline" className={getStatusColor(user.status)}>
        {user.status}
      </Badge>
    </div>
  </div>
);

/**
 * UserTable component for displaying users in a responsive table format.
 *
 * Features:
 * - Responsive design: mobile cards on small screens, full table on larger screens
 * - Search/filter input within the table component
 * - Skeleton loading state
 * - Clickable rows for viewing user details
 * - Action buttons for edit, change password, and delete
 * - Role and status badges with appropriate colors
 *
 * @component
 * @param props - Component props
 * @param props.users - Array of users to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.searchValue - Current search term value
 * @param props.onSearchChange - Callback for search input changes
 * @param props.onView - Callback for viewing user details
 * @param props.onEdit - Callback for editing a user
 * @param props.onDelete - Callback for deleting a user
 * @param props.onChangePassword - Callback for changing user password
 * @param props.onRefresh - Callback for refresh action
 * @param props.className - Additional CSS classes
 * @returns The rendered user table component
 */
export const UserTable = ({
  users,
  isLoading,
  searchValue = '',
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  onChangePassword,
  className = '',
}: UserTableProps) => {
  const filteredUsers = useMemo(() => {
    if (!searchValue) return users;
    const search = searchValue.toLowerCase();
    return users.filter(user => 
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search) ||
      user.user_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  }, [users, searchValue]);

  if (isLoading) {
    return <UserTableSkeleton className={className} />;
  }

  return (
    <div className={className}>
      {onSearchChange && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, username or email..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Filter users"
            />
          </div>
          {searchValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              Clear
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
      )}

      <div className="space-y-3 sm:hidden">
        {filteredUsers.map((user) => (
          <UserTableCard
            key={user.id}
            user={user}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangePassword={onChangePassword}
          />
        ))}
      </div>

      <div className="hidden sm:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id}
                  className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onView?.(user)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">@{user.user_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-32" title={user.email || undefined}>
                      {user.email || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.phone_crm || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {user.department || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(user)}>
                          <span className="sr-only">Edit</span>
                          ✏️
                        </Button>
                      )}
                      {onChangePassword && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChangePassword(user)}>
                          <span className="sr-only">Change password</span>
                          🔑
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(user)}>
                          <span className="sr-only">Delete</span>
                          🗑️
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserView;
