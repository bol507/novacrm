import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/user-service';
import { toast } from 'sonner';
import type { ChangePasswordRequest } from '../types/user';

interface ChangePasswordVariables {
  userId: number;
  data: ChangePasswordRequest;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ userId, data }: ChangePasswordVariables) => 
      userService.changeUserPassword(userId, data),
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