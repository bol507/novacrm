import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile-service';
import { toast } from 'sonner';

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profileService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => profileService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success("Perfil actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al actualizar el perfil");
    },
  });
};