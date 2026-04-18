import { useQuery } from '@tanstack/react-query';
import { userService } from '@/features/users/services/user-service';
import type { PaginatedResponse } from '@/features/clients/types/client';
import type { User } from '@/features/users/types/user';

/**
 * Options for the useUsers hook
 */
export interface UseUsersOptions {
  page?: number;
  perPage?: number;
  search?: string;
  active?: boolean;
  enabled?: boolean;
}

/**
 * Hook for fetching a paginated list of users.
 *
 * Provides automatic caching, stale time management, and retry logic.
 * Filters to active users by default to exclude inactive/archived records.
 * The query can be conditionally enabled for scenarios like dependent fetching.
 *
 * @param options - Configuration options for the query
 * @param options.page - Page number to fetch (1-based, default: 1)
 * @param options.perPage - Number of items per page (default: 20)
 * @param options.search - Optional search term to filter users by name or email
 * @param options.active - Filter by active status only (default: true)
 * @param options.enabled - Conditionally enable the query (default: true)
 * @returns Query result containing paginated user data, loading state, and error state
 *
 * @example
 * // Basic pagination
 * const { data, isLoading } = useUsers({ page: 1, perPage: 10 });
 *
 * @example
 * // With search term
 * const { data, refetch } = useUsers({ search: 'john' });
 *
 * @example
 * // Show all users including inactive
 * const { data } = useUsers({ active: false });
 *
 * @example
 * // Conditionally enabled query
 * const { data } = useUsers({
 *   search: searchTerm,
 *   enabled: searchTerm.length >= 3
 * });
 */
export const useUsers = (options: UseUsersOptions = {}) => {
  const {
    page = 1,
    perPage = 20,
    search,
    active = true,
    enabled = true,
  } = options;

  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['users', { page, perPage, search, active }],
    queryFn: () => userService.getUsers(page, perPage, search, active),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
};