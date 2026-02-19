import { useQuery } from '@tanstack/react-query';
import { clientService } from '../services/client-service';

export const useSearchClients = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-clients', searchTerm],
    queryFn: () => clientService.searchClients(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 0, 
    retry: 1,
  });
};