import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user-service";
import type { UpdateUserRequest, User } from '../types/user';
import { toast } from 'sonner';

export type UpdateUserVariables = {
  id: number;
} & Omit<UpdateUserRequest, 'password'>;

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation<User, Error, UpdateUserVariables>({
        mutationFn: async ({ id, ...data }) => {
           return await userService.updateUser(id, data);
            
        },
        onSuccess: (updatedUser, variables) => {
            queryClient.setQueryData(['user-detail', variables.id], updatedUser);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error updating user');
        },
    });
};