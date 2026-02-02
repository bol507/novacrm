import { useQuery } from '@tanstack/react-query';
import { userService } from '@/features/users/services/user-service';
import type { PaginatedResponse } from '@/features/clients/types/client';
import type { User } from '@/features/users/types/user';

export const useUsers = (page: number = 1, perPage: number = 20, search?: string) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['users', page, perPage, search],
    queryFn: () => userService.getUsers(page, perPage, search),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};