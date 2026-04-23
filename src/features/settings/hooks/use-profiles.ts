import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings-service';
import { toast } from 'sonner';
import type { CreateProfileRequest, UpdateProfileRequest } from '../types/settings';

export const useProfiles = () => useQuery({
  queryKey: ['profiles'],
  queryFn: () => settingsService.getProfiles(),
  select: (res) => res.data,
});

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateProfileRequest) => settingsService.updateProfile(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile permissions updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update profile'),
  });
};

/**
 * Hook for assigning a profile to a specific role.
 * Updates the vtiger_profile2role relationship and clears permissions cache.
 */
export const useUpdateRoleProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, profileId }: { roleId: string; profileId: string }) => {
      return settingsService.assignProfileToRole(roleId, profileId);
    },
    onSuccess: () => {
      // Invalidate roles query to refresh the tree view if needed
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      
      toast.success('Profile assigned to role successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to assign profile';
      toast.error(message);
    },
  });
};

export const useCreateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProfileRequest) => settingsService.createProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create profile');
    },
  });
};
