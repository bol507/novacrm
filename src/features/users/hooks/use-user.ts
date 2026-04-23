import { useQuery } from '@tanstack/react-query';
import type { User } from '../types/user';
import { userService } from '../services/user-service';

export const useUser = (id: number | null | undefined) => {
    return useQuery<User, Error>({
        queryKey: ['user', id],
        queryFn: async () => {
            if (!id || id <= 0) {
                throw new Error('Invalid user ID');
            }
            const response = await userService.getUserById(id);
            return response.data;
        },
        enabled: !!id && id > 0,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        retry: false,
    });
};