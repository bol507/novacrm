import { useQuery } from '@tanstack/react-query';
import type { Client } from '@/features/clients/types/client';
import { clientService } from '@/features/clients/services/client-service';

export const useClient = (id: number | null | undefined) => {
  return useQuery<Client, Error>({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id || id <= 0) {
        throw new Error('Invalid client ID');
      }
      return await clientService.getClientById(id);
    },
    enabled: !!id && id > 0, 
    staleTime: 5 * 60 * 1000,
    retry: false, 
  });
};