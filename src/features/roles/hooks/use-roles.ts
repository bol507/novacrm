import { useQuery } from '@tanstack/react-query';
import { roleService } from '../services/role-service';
import type { Role } from '../types/role';

interface UseRolesOptions {
  minDepth?: number;
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Hook for fetching hierarchical roles from Vtiger.
 *
 * @param options - Configuration options for filtering and caching
 * @returns Query result with roles, loading state, and error state
 *
 * @example
 * // Basic usage
 * const {  roles, isLoading, error } = useRoles();
 *
 * @example
 * // With filters
 * const {  roles } = useRoles({ minDepth: 1, staleTime: 10 * 60 * 1000 });
 */
export const useRoles = (options: UseRolesOptions = {}) => {
  const { minDepth = 0, enabled = true, staleTime = 5 * 60 * 1000 } = options;

  const query = useQuery<Role[], Error>({
    queryKey: ['roles', { minDepth }],
    queryFn: async () => {
      const allRoles = await roleService.getAvailableRoles();
      // ✅ Filtrar solo una vez, en la queryFn
      return allRoles.filter(role => role.depth >= minDepth);
    },
    enabled,
    staleTime,
    retry: 1,
  });

 
  const roles = query.data ?? [];

  return {
    ...query,
    roles, 
  };
};