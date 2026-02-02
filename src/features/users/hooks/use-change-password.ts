import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/user-service';
import { toast } from 'sonner';

export const useChangePassword = (userId: number) => {
  return useMutation({
    mutationFn: (newPassword: string) => 
      userService.changeUserPassword(userId, newPassword),
    onSuccess: () => {
      toast.success("Contraseña actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Error al cambiar la contraseña"
      );
    },
  });
};