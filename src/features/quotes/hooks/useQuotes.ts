import { useQuery } from '@tanstack/react-query';
import { quoteService } from '../services/quoteService';
import type { Quote } from '../types/quote';

export const useQuotes = (page: number, perPage: number, search?: string) => {
  return useQuery({
    queryKey: ['quotes', page, perPage, search],
    queryFn: () => quoteService.getQuotes(page, perPage, search),
    staleTime: 5 * 60 * 1000, 
  });
};