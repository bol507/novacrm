import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user-service';
import { toast } from 'sonner';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
     onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['user', userId], exact: false });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Error deleting user';
      toast.error(message, {
        description: 'Please try again or contact support if the issue persists',
      });
    },
  });
};