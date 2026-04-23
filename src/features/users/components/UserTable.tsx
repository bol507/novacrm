import { useMemo } from 'react';
import type { User } from '../types/user';
import { UserTableSkeleton } from './UserTableSkeleton';
import { Button } from '@/components/ui/button';
import { UserTableCard } from './UserTableCard';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from './GetStatusColor';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getHierarchicalRoleColor } from './getHierarchicalRoleColor';

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
                  
                  {/* ✅ COLUMNA ROLE ACTUALIZADA */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.is_admin && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-xs">
                          Admin
                        </Badge>
                      )}
                      {user.rolename ? (
                        <Badge variant="outline" className={getHierarchicalRoleColor(user.rolename)} title={user.rolename}>
                          {user.rolename}
                        </Badge>
                      ) : user.role_id ? (
                        <Badge variant="secondary" className="text-xs">{user.role_id}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </td>
                  
                  {/* Actions se mantienen igual */}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(user)}>
                          <span className="sr-only">Edit</span>✏️
                        </Button>
                      )}
                      {onChangePassword && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChangePassword(user)}>
                          <span className="sr-only">Change password</span>🔑
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(user)}>
                          <span className="sr-only">Delete</span>🗑️
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