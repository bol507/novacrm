import { useState } from 'react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../hooks/use-roles';
import { RoleTree } from '../components/RoleTree';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import type { Role } from '../types/settings';
import { RoleFormDialog } from '../components/RoleFormDialog';

export const RolesPage = () => {
  const { data: roles, isLoading } = useRoles();
  const create = useCreateRole();
  const update = useUpdateRole();
  const del = useDeleteRole();
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Role Hierarchy</h1>
          <p className="text-muted-foreground">Manage organizational structure and data visibility</p>
        </div>
        <RoleFormDialog 
          trigger={<Button><Plus className="mr-2 h-4 w-4" />New Role</Button>}
          onSubmit={(data) => create.mutate(data)}
          isPending={create.isPending}
        />
      </div>

      <div className="bg-card border rounded-lg p-4">
        <RoleTree 
          roles={roles || []} 
          onEdit={setEditingRole}
          onDelete={del.mutate}
          onAssignProfile={() => {/* integrate assign dialog or inline */}}
        />
      </div>

      {editingRole && (
        <RoleFormDialog 
          open 
          onOpenChange={() => setEditingRole(null)}
          role={editingRole}
          onSubmit={(data) => update.mutate({ id: editingRole.roleid, ...data })}
          isPending={update.isPending}
        />
      )}
    </div>
  );
};