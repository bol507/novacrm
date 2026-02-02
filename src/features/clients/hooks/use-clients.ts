import { useQuery } from '@tanstack/react-query';
import { clientService } from '@/features/clients/services/client-service';
import type { PaginatedResponse, Client } from '@/features/clients/types/client';

export const useClients = (page: number = 1, perPage: number = 20, search?: string) => {
  return useQuery<PaginatedResponse<Client>, Error>({
    queryKey: ['clients', page, perPage, search],
    queryFn: () => clientService.getClients(page, perPage, search),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};