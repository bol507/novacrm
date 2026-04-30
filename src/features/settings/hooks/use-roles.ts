import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings-service';
import { toast } from 'sonner';
import type {  UpdateRoleRequest } from '../types/settings';
import type { UseFormReturn } from 'react-hook-form';
import { mapBackendErrors } from '../utils/error-mapper';

export const useRoles = () => useQuery({
  queryKey: ['settings-roles'],
  queryFn: () => settingsService.getRoles(),
  select: (res) => res.data.data,
  staleTime: 0 
});

export const useCreateRole = (form?: UseFormReturn<any>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.createRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-roles'] });
      toast.success('Role created successfully');
    },
    onError: (err: any) => {
      if (form) mapBackendErrors(form, err);
      toast.error(err.response?.data?.error || 'Failed to create role');
    }
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateRoleRequest) => settingsService.updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update role'),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete role'),
  });
};

