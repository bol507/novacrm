import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role-service';
import { toast } from 'sonner';

interface AssignRoleVariables {
  userId: number;
  roleId: string;
}

/**
 * Hook for assigning a hierarchical role to a user.
 *
 * Automatically invalidates related queries on success.
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: AssignRoleVariables) => {
      await roleService.assignRole(userId, roleId);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error assigning role');
    },
  });
};