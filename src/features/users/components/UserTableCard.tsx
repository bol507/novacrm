
import { Badge } from "@/components/ui/badge";
import type { User } from "../types/user";
import { getHierarchicalRoleColor } from "./getHierarchicalRoleColor";
import { getStatusColor } from "./GetStatusColor";

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
export const UserTableCard = ({
  user,
  onView,
  onEdit,
  onDelete,
  onChangePassword,
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
    
    {/*  Badges actualizados */}
    <div className="flex items-center gap-2 flex-wrap justify-end">
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
      ) : null}
      <Badge variant="outline" className={getStatusColor(user.status)}>
        {user.status}
      </Badge>
    </div>
  </div>
);