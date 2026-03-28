import { useQuery } from '@tanstack/react-query';
import { quoteService } from '../services/quoteService';

/**
 * Hook for fetching a single quote by ID.
 *
 * Provides automatic caching and state management for quote detail data.
 * The query is only enabled when a valid quoteId is provided.
 *
 * @param quoteId - The ID of the quote to fetch (as string, will be parsed to number)
 * @returns Query result containing quote data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data: quote, isLoading, error } = useQuoteDetail('123');
 *
 * @example
 * // With conditional rendering
 * const { data: quote, isLoading } = useQuoteDetail(quoteId);
 *
 * if (isLoading) return <Spinner />;
 * if (!quote) return <NotFound />;
 *
 * return <QuoteDetail quote={quote} />;
 *
 * @example
 * // With error handling
 * const { data, error, refetch } = useQuoteDetail(quoteId);
 *
 * if (error) {
 *   return (
 *     <div>
 *       <p>Failed to load quote: {error.message}</p>
 *       <Button onClick={() => refetch()}>Retry</Button>
 *     </div>
 *   );
 * }
 */
export const useQuoteDetail = (quoteId: string) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quoteService.getQuote(parseInt(quoteId)),
    enabled: !!quoteId && quoteId !== 'undefined',
    staleTime: 0,
    retry: 1,
  });
};