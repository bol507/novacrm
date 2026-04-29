
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useMemo } from 'react';
import { 
  TABID_TO_MODULE_KEY, 
  type ModuleKey, 
  type PermissionAction 
} from '@/features/settings/types/settings';
import { mapBackendPermissions } from '@/shared/lib/module-mapper';


/**
 * Hook for checking user permissions on modules.
 *
 * Backend returns permissions keyed by tabid, then the hook maps them to
 * frontend ModuleKey values. Admin users bypass all permission checks.
 *
 * @returns Object containing permission checking functions, allowed modules, and user context
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canAccess: (_: ModuleKey) => false,
        canRead: (_: ModuleKey) => false,
        canCreate: (_: ModuleKey) => false,
        canEdit: (_: ModuleKey) => false,
        canDelete: (_: ModuleKey) => false,
        allowedModules: [] as ModuleKey[],
      };
    }

    if (user.is_admin) {
      return {
        canAccess: (_: ModuleKey) => true,
        canRead: (_: ModuleKey) => true,
        canCreate: (_: ModuleKey) => true,
        canEdit: (_: ModuleKey) => true,
        canDelete: (_: ModuleKey) => true,
        allowedModules: Object.values(TABID_TO_MODULE_KEY) as ModuleKey[],
      };
    }

    const mapped = mapBackendPermissions(
      user.permissions ?? {},
      user.available_modules ?? {}
    );

    const has = (mod: ModuleKey, action: PermissionAction): boolean => {
      return mapped[mod]?.includes(action) ?? false;
    };

    const allowedModules = (Object.values(TABID_TO_MODULE_KEY) as ModuleKey[]).filter(
      (mod) => has(mod, 'read')
    );

    return {
      canAccess: (mod: ModuleKey) => has(mod, 'read'),
      canRead: (mod: ModuleKey) => has(mod, 'read'),
      canCreate: (mod: ModuleKey) => has(mod, 'create'),
      canEdit: (mod: ModuleKey) => has(mod, 'write'),
      canDelete: (mod: ModuleKey) => has(mod, 'delete'),
      allowedModules,
    };
  }, [user]);

  return {
    isAdmin: user?.is_admin ?? false,
    profileId: user?.profile_id ?? null,
    roleId: user?.role_id ?? null,
    roleName: user?.rolename ?? null,
    ...permissions,
  };
};