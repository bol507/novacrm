// src/features/settings/pages/SettingsPage.tsx

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleTree } from '../components/RoleTree';
import { RoleFormDialog } from '../components/RoleFormDialog';
import { ProfilePermissionsForm } from '../components/ProfilePermissionsForm';
import { useRoles, useCreateRole,  useDeleteRole } from '../hooks/use-roles';
import { useProfiles, useUpdateProfile } from '../hooks/use-profiles';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Shield, Key } from 'lucide-react';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'profiles'>('roles');
  
  // Hooks para Roles
  const {  data: roles, isLoading: rolesLoading } = useRoles();
  const createRole = useCreateRole();
  //const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  
  // Hooks para Perfiles
  const {  data: profiles, isLoading: profilesLoading } = useProfiles();
  const updateProfile = useUpdateProfile();

  if (rolesLoading || profilesLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y acciones contextuales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {activeTab === 'roles' ? (
              <>
                <Shield className="h-6 w-6" />
                Role Hierarchy
              </>
            ) : (
              <>
                <Key className="h-6 w-6" />
                Permission Profiles
              </>
            )}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === 'roles'
              ? 'Manage organizational structure and data visibility rules'
              : 'Configure module access and CRUD permissions for each profile'}
          </p>
        </div>

        {/* Acciones contextuales por tab */}
        {activeTab === 'roles' && (
          <RoleFormDialog 
            trigger={<Button><Plus className="mr-2 h-4 w-4" />New Role</Button>}
            onSubmit={(data) => createRole.mutate(data)}
            isPending={createRole.isPending}
          />
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'roles' | 'profiles')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <Key className="h-4 w-4" />
            Profiles
          </TabsTrigger>
        </TabsList>

        {/* Tab: Role Hierarchy */}
        <TabsContent value="roles" className="mt-6">
          <div className="bg-card border rounded-lg p-4">
            <RoleTree 
              roles={roles || []} 
              onEdit={(_role) => {/* abrir RoleFormDialog en modo edición */}}
              onDelete={(role) => deleteRole.mutate(role.roleid)}
              onAssignProfile={() => {}} // Implementa tu lógica de asignación
            />
          </div>
        </TabsContent>

        {/* Tab: Permission Profiles */}
        <TabsContent value="profiles" className="mt-6 space-y-4">
          {profiles?.map(profile => (
            <ProfilePermissionsForm 
              key={profile.profileid}
              profile={profile}
              onSave={(data) => updateProfile.mutate({ id: profile.profileid, ...data })}
              isPending={updateProfile.isPending}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;