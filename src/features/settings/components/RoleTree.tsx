import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Role } from '../types/settings';
import { useConfirm } from '@/components/confirm-dialog';

interface RoleTreeProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAssignProfile: (role: Role) => void;
}

const RoleNode = ({ role, roles, onEdit, onDelete, onAssignProfile }: RoleTreeProps & { role: Role; roles: Role[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = roles.filter(r => r.parentrole.startsWith(role.parentrole + role.roleid + '::'));
  const showConfirm = useConfirm();

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Role',
      description: `Delete "${role.rolename}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: () => onDelete(role),
    });
  };

  return (
    <div className="ml-4 border-l-2 border-border">
      <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsExpanded(!isExpanded)}>
            {children.length > 0 ? (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : <div className="h-4 w-4" />}
          </Button>
          <span className="font-medium">{role.rolename}</span>
          <Badge variant="secondary" className="text-[10px]">{role.depth > 0 ? `Depth ${role.depth}` : 'Root'}</Badge>
          {role.users_count > 0 && <Badge variant="outline" className="text-[10px]">{role.users_count} users</Badge>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAssignProfile(role)}>
            <Link2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(role)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {isExpanded && children.map(child => (
        <RoleNode key={child.roleid} role={child} roles={roles} onEdit={onEdit} onDelete={onDelete} onAssignProfile={onAssignProfile} />
      ))}
    </div>
  );
};

export const RoleTree = ({ roles, onEdit, onDelete, onAssignProfile }: RoleTreeProps) => {
  const rootRoles = roles.filter(r => r.depth === 0);
  if (roles.length === 0) return <div className="text-center py-8 text-muted-foreground">No roles found</div>;
  
  return (
    <div className="space-y-2">
      {rootRoles.map(role => (
        <RoleNode key={role.roleid} role={role} roles={roles} onEdit={onEdit} onDelete={onDelete} onAssignProfile={onAssignProfile} />
      ))}
    </div>
  );
};