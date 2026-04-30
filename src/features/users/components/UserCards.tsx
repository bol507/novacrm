import { type User } from '@/features/users/types/user';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail,
    Phone,
    Building2,
    MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getHierarchicalRoleColor } from './getHierarchicalRoleColor';

/**
 * Props for UserCards component
 */
interface UserCardsProps {
    users: User[];
    isLoading: boolean;
    onUserClick: (user: User) => void;
    onEditUser?: (user: User) => void;
    onChangePassword?: (user: User) => void;
    onDeleteUser?: (user: User) => void;
}

/**
 * Gets the CSS classes for status badge styling based on user status
 * 
 * @param status - User status string ('Active' or 'Inactive')
 * @returns CSS class string for badge styling with appropriate colors
 * 
 * @example
 * getStatusColor('Active') // returns green styling classes
 * getStatusColor('Inactive') // returns red styling classes
 */
const getStatusColor = (status: string) => {
    return status === "Active"
        ? "bg-green-500/10 text-green-600 border-green-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20";
};

/**
 * UserCards Component
 * 
 * Displays a grid of user cards with user information and action menus.
 * Each card shows user avatar, name, username, department, email, phone, role, and status.
 * Includes a dropdown menu for actions like view details, edit, change password, and delete.
 * 
 * @component
 * @param {UserCardsProps} props - Component props
 * @param {User[]} props.users - Array of user objects to display
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {function} props.onUserClick - Callback for viewing user details
 * @param {function} [props.onEditUser] - Optional callback for editing user
 * @param {function} [props.onChangePassword] - Optional callback for changing password
 * @param {function} [props.onDeleteUser] - Optional callback for deleting user
 * 
 * @returns {JSX.Element} Grid of user cards or loading/empty states
 * 
 * @example
 * // Basic usage with all callbacks
 * <UserCards 
 *   users={users} 
 *   isLoading={isLoading} 
 *   onUserClick={handleViewDetails}
 *   onEditUser={handleEdit}
 *   onChangePassword={handleChangePassword}
 *   onDeleteUser={handleDelete}
 * />
 * 
 * @example
 * // Usage with minimal callbacks
 * <UserCards 
 *   users={users} 
 *   isLoading={false} 
 *   onUserClick={handleViewDetails}
 * />
 * 
 * @remarks
 * - Displays loading skeleton when isLoading is true
 * - Shows empty state message when users array is empty
 * - Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
 * - Admin users display a shield icon next to their name
 * - Status badge color changes based on active/inactive status
 * - All dropdown actions prevent event propagation to avoid card click conflicts
 * 
 * @see {@link User} for user object structure
 * @see {@link Card} for underlying card component
 * @see {@link DropdownMenu} for action menu component
 */
export const UserCards = ({ 
    users, 
    isLoading, 
    onUserClick, 
    onEditUser, 
    onChangePassword, 
    onDeleteUser 
}: UserCardsProps) => {
    // Display loading skeleton when data is being fetched
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-muted animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 pb-4 space-y-3">
                                <div className="h-3 bg-muted rounded w-full" />
                                <div className="h-3 bg-muted rounded w-5/6" />
                                <div className="h-3 bg-muted rounded w-2/3" />
                            </div>
                            <div className="px-4 py-3 bg-muted/30 border-t">
                                <div className="h-4 bg-muted rounded w-1/4" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Display empty state when no users are found
    if (users.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                </CardContent>
            </Card>
        );
    }

    // Render user cards grid
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
              {/* Dropdown menu se mantiene igual */}
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
            
            {/* Info de contacto se mantiene igual */}
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
            
            {/*  BADGES ACTUALIZADOS: is_admin + rolename */}
            <div className="mt-3 flex flex-wrap gap-2">
              {/* Badge de Admin (flag de sistema) */}
              {user.is_admin && (
                <Badge 
                  variant="outline" 
                  className="bg-purple-500/10 text-purple-700 border-purple-500/20 font-medium"
                  title="System Administrator"
                >
                  Admin
                </Badge>
              )}
              
              {/* Badge de Rol Jerárquico */}
              {user.rolename ? (
                <Badge 
                  variant="outline" 
                  className={getHierarchicalRoleColor(user.rolename)}
                  title={`Role: ${user.rolename}`}
                >
                  {user.rolename}
                </Badge>
              ) : user.role_id ? (
                // Fallback: mostrar role_id si no hay rolename
                <Badge variant="secondary" className="text-xs" title={`Role ID: ${user.role_id}`}>
                  {user.role_id}
                </Badge>
              ) : null}
              
              {/* Badge de Status (se mantiene igual) */}
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