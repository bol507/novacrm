import { useQuery } from '@tanstack/react-query';
import { quoteService } from '../services/quoteService';

export const useQuoteDetail = (quoteId: string) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quoteService.getQuote(parseInt(quoteId)),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000, 
  });
};