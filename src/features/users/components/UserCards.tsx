import { type User } from '@/features/users/types/user';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail,
    Phone,
    Building2,
    MoreVertical,
    Shield,
    Trash2Icon,
    KeyIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Props for UserCards component
 */
interface UserCardsProps {
    /** Array of user objects to display as cards */
    users: User[];
    /** Loading state indicator */
    isLoading: boolean;
    /** Callback fired when user clicks on a user card to view details */
    onUserClick: (user: User) => void;
    /** Optional callback fired when user clicks edit action */
    onEditUser?: (user: User) => void;
    /** Optional callback fired when user clicks change password action */
    onChangePassword?: (user: User) => void;
    /** Optional callback fired when user clicks delete action */
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
                <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Card Header with avatar and actions menu */}
                        <div className="flex items-start justify-between p-4 pb-3">
                            {/* User avatar and name section */}
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-semibold text-primary">
                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-foreground truncate">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        {/* Admin shield icon */}
                                        {user.role === 'Admin' && (
                                            <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        @{user.user_name}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Actions dropdown menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover">
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUserClick(user);
                                        }}
                                    >
                                        <Building2 className="h-4 w-4" />
                                        View details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditUser?.(user);
                                        }}
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChangePassword?.(user);
                                        }}
                                    >
                                        <KeyIcon className="h-4 w-4" />
                                        Change Password
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteUser?.(user);
                                        }}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Card Body with user details */}
                        <div className="px-4 pb-4 space-y-3">
                            {/* Department (conditional) */}
                            {user.department && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {user.department}
                                    </span>
                                </div>
                            )}

                            {/* Email (conditional) */}
                            {user.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground truncate">
                                        {user.email}
                                    </span>
                                </div>
                            )}

                            {/* Phone (conditional) */}
                            {user.phone_crm && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {user.phone_crm}
                                    </span>
                                </div>
                            )}

                            {/* Role */}
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Card Footer with status badge */}
                        <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
                            <Badge variant="outline" className={getStatusColor(user.status)}>
                                {user.status === "Active" ? "Active" : "Inactive"}
                            </Badge>
                            {/* Admin label for admin users */}
                            {user.role === 'Admin' && (
                                <span className="text-xs text-amber-600 font-medium">
                                    Administrator
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};