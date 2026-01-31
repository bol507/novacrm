import { useQuery } from '@tanstack/react-query';
import type { Client } from '@/types/client';
import { clientService } from '@/services/client-service';

export const useClient = (id: number) => {
  return useQuery<Client, Error>({
    queryKey: ['client', id],
    queryFn: () => clientService.getClientById(id),
    enabled: !!id, 
    staleTime: 5 * 60 * 1000,
  });
};