import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleFormDialog } from '../components/RoleFormDialog';
import { ProfilePermissionEditor } from '../components/ProfilePermissionEditor';
import { useRoles, useCreateRole, useDeleteRole, useUpdateRole } from '../hooks/use-roles';
import { useCreateProfile, useProfiles, useUpdateProfile, useUpdateRoleProfile } from '../hooks/use-profiles';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { settingsService } from '../services/settings-service';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Shield, Key } from 'lucide-react';
import type { PermissionAction, Role } from '../types/settings';
import { CreateProfileDialog } from '../components/CreateProfileDialog';
import { RoleTree } from '../components/RoleTree';

const isValidPermission = (p: string): p is PermissionAction => {
  return ['read', 'write', 'create', 'delete'].includes(p);
};

/**
 * SettingsPage component for managing roles and permission profiles.
 *
 * Features:
 * - Tab navigation between Role Hierarchy and Permission Profiles
 * - Role management (create, delete, update, view hierarchy)
 * - Profile management (create, edit permissions)
 * - Profile permission editing with module-level CRUD permissions
 *
 * @component
 * @returns The rendered settings page
 */
export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'profiles'>('roles');
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { user: authUser } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const deleteRole = useDeleteRole();
  const assignProfile = useUpdateRoleProfile();

  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const updateProfile = useUpdateProfile();
  const createProfile = useCreateProfile();

  const handleLoadProfilePermissions = async (profileId: string) => {
    try {
      const response = await settingsService.getProfilePermissions?.(profileId);
      const modules = response?.data?.data?.modules ?? [];
      return modules.map(mod => ({
        tabid: mod.tabid,
        name: mod.name,
        permissions: (mod.permissions ?? []).filter(isValidPermission),
      }));
    } catch (error) {
      console.error('Failed to load profile permissions:', error);
      return [];
    }
  };

  const handleSaveProfilePermissions = (
    profileId: string,
    data: { name: string; modules: { tabid: number; permissions: string[] }[] }
  ) => {
    updateProfile.mutate({ id: profileId, ...data });
  };

  

  if (rolesLoading || profilesLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const profileOptions = profiles?.map(p => ({
    profileid: p.profileid,
    name: p.name,
  })) ?? [];

  const handleCreateSuccess = (newProfileId: string) => {
    setCreateDialogOpen(false);
    setSelectedProfileId(newProfileId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {activeTab === 'roles' ? (
              <><Shield className="h-6 w-6" />Role Hierarchy</>
            ) : (
              <><Key className="h-6 w-6" />Permission Profiles</>
            )}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === 'roles'
              ? 'Manage organizational structure and data visibility rules'
              : 'Configure module access and CRUD permissions for each profile'}
          </p>
        </div>

        {activeTab === 'roles' ? (
          <RoleFormDialog
            trigger={<Button><Plus className="mr-2 h-4 w-4" />New Role</Button>}
            onSubmit={(data) => createRole.mutate(data)}
            isPending={createRole.isPending}
          />
        ) : (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Profile
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'roles' | 'profiles')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles" className="gap-2"><Shield className="h-4 w-4" />Roles</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2"><Key className="h-4 w-4" />Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <div className="bg-card border rounded-lg p-4">
            <RoleTree
              roles={roles || []}
              onEdit={(role) => {
                setEditingRole(role);
                setEditDialogOpen(true);
              }}
              onDelete={(roleId) => deleteRole.mutate(roleId)}
              profiles={profileOptions}
              onAssignProfile={(roleId, profileId) => assignProfile.mutate({ roleId, profileId })}
            />
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          <ProfilePermissionEditor
            profiles={profileOptions}
            availableModules={authUser?.available_modules ?? {}}
            selectedProfileId={selectedProfileId}
            onProfileSelect={setSelectedProfileId}
            onLoadPermissions={handleLoadProfilePermissions}
            onSave={handleSaveProfilePermissions}
            isPending={updateProfile.isPending}
          />
        </TabsContent>
      </Tabs>

      <CreateProfileDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        roles={roles || []}
        isPending={createProfile.isPending}
        onSubmit={(data) => createProfile.mutate(data, {
          onSuccess: (res) => {
            if (res?.profileid) {
              handleCreateSuccess(res.profileid);
            }
          },
        })}
      />
      {/* ✅ DIALOG DE EDICIÓN (Reutiliza RoleFormDialog con Sharing Rule) */}
      <RoleFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingRole(null); // Limpiar al cerrar
        }}
        role={editingRole} // ← Esto activa el modo "Editar" en el componente
        onSubmit={(data) => {
          updateRole.mutate(
            { id: editingRole!.roleid, ...data }, // Combina ID con name, sharing_rule, etc.
            { onSuccess: () => setEditDialogOpen(false) }
          );
        }}
        isPending={updateRole.isPending}
      />

    </div>
  );
};

export default SettingsPage;