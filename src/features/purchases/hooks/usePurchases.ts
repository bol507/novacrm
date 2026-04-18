import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { purchaseService } from '../services/purchaseService';
import type { AxiosError } from 'axios';

export const usePurchases = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  filters?: {
    status?: string;
    projectId?: number;
  },
   options?: Omit<
    UseQueryOptions<any, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: ['purchases', page, limit, searchTerm, filters],
    queryFn: () => purchaseService.getPurchases(page, limit,searchTerm, filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};