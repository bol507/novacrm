import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user-service';
import { toast } from 'sonner';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Usuario eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Error al eliminar el usuario"
      );
    },
  });
};