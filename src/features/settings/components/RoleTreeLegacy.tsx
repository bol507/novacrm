import { useState } from 'react';
import { ChevronRight, ChevronDown, Shield, User, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Role } from '../types/settings';

interface RoleTreeProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

interface RoleNode extends Role {
  children?: RoleNode[];
}

/**
 * Component for displaying role hierarchy as an expandable tree.
 *
 * Features:
 * - Recursive tree rendering from flat role list
 * - Expand/collapse child roles
 * - Visual distinction for root roles
 * - Hover actions for edit and delete
 *
 * @component
 * @param props - Component props
 * @param props.roles - Array of roles with parentrole path
 * @param props.onEdit - Callback when edit action is triggered
 * @param props.onDelete - Callback when delete action is triggered
 * @returns The rendered role tree component
 */
export const RoleTreeLegacy = ({ roles, onEdit, onDelete }: RoleTreeProps) => {
  
  const buildHierarchy = (flatRoles: Role[]): RoleNode[] => {
    const map = new Map<string, RoleNode>();
    const roots: RoleNode[] = [];

    flatRoles.forEach(role => {
      map.set(role.roleid, { ...role, children: [] });
    });

    flatRoles.forEach(role => {
      const node = map.get(role.roleid);
      if (!node) return;

      const parts = role.parentrole.split('::').filter(Boolean);
      const parentId = parts.length > 1 ? parts[parts.length - 2] : null;

      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId);
        parent?.children?.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const treeData = buildHierarchy(roles);

  if (treeData.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-lg border">
        <Shield className="mx-auto h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-semibold">No roles found</h3>
        <p className="text-sm mt-2">Create a role to start building the hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {treeData.map(node => (
        <RoleNodeItem 
          key={node.roleid} 
          node={node} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const RoleNodeItem = ({ 
  node, 
  onEdit, 
  onDelete 
}: { 
  node: RoleNode; 
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = node.depth === 0;

  return (
    <div className="rounded-md border bg-card">
      <div 
        className={cn(
          "flex items-center gap-3 p-3 select-none",
          isRoot ? "bg-slate-900 text-white" : "hover:bg-accent/50"
        )}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-5 flex justify-center">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />
          ) : (
            <div className="w-4" />
          )}
        </div>

        {isRoot ? (
          <Shield className="h-5 w-5 text-primary" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.rolename}</span>
            {isRoot && <Badge variant="secondary" className="text-xs">Root</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span>ID: {node.roleid}</span>
            <span>Sharing: {node.sharing_rule}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {!isRoot && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(node.roleid); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </Button>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="border-t bg-muted/20">
          <div className="pl-8 border-l border-muted ml-6 mt-2 mb-2">
            {node.children?.map(child => (
              <div key={child.roleid} className="mb-2">
                <RoleNodeItem node={child} onEdit={onEdit} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};