import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user-service';

export const useSearchUsers = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-users', searchTerm],
    queryFn: () => userService.searchUsers(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 0,
    retry: 1,
  });
};