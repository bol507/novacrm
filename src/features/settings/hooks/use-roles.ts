import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings-service';
import { toast } from 'sonner';
import type { CreateRoleRequest, UpdateRoleRequest } from '../types/settings';

export const useRoles = () => useQuery({
  queryKey: ['roles'],
  queryFn: () => settingsService.getRoles(),
  select: (res) => res.data.data,
});

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.createRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create role'),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateRoleRequest) => settingsService.updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update role'),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.deleteRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete role'),
  });
};