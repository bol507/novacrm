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
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({
                queryKey: ['user', id],
                exact: false
            });
            queryClient.invalidateQueries({
                queryKey: ['users','user'],
                exact: false
            });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error updating user');
        },
    });
};