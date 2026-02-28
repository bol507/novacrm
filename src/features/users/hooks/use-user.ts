import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { User } from '../types/user';

export const useUser = (id: number | null | undefined) => {
    return useQuery<User, Error>({
        queryKey: ['user', id],
        queryFn: async () => {
            if (!id || id <= 0) {
                throw new Error('Invalid user ID');
            }
            const response = await apiClient.get(`/users/${id}`);
            return response.data.data;
        },
        enabled: !!id && id > 0,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};