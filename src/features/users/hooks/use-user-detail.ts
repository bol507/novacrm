import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/user-service"
import type { User } from "../types/user";

/**
 * Hook for fetching a single user's details.
 *
 * @param userId - The ID of the user to fetch (null/undefined disables the query)
 * @returns Query result with user data, loading state, and error state
 *
 * @example
 * const { data: user, isLoading, error } = useUserDetail(123);
 */
export const useUserDetail = (userId: number | null | undefined) => {
  return useQuery<User, Error>({
    queryKey: ['user-detail', userId],
    queryFn: async () => {
      if (!userId || userId <= 0) {
        throw new Error('Invalid user ID');
      }
      const response = await userService.getUserById(userId);
      return response.data;
    },
    enabled: !!userId && userId > 0,
    staleTime: 2 * 60 * 1000, 
    retry: 1,
  });
};