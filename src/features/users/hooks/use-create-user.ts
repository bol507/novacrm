import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user-service';
import type { CreateUserRequest } from '../types/user';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await userService.createUser(data);
     
      return response.user_id;
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
    },
    onError: (error: any) => {
      console.error('[useCreateUser] Error:', error);
    },
  });
};