import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { clientService } from '../services/client-service';
import type { ClientSummary } from '../types/client';

/**
 * Hook for fetching a client's related entity summary.
 *
 * Provides summary counts for opportunities, quotes, projects, and contacts
 * associated with the client. The query is only enabled when a valid clientId
 * is provided and the enabled flag is true.
 *
 * @param clientId - The ID of the client to fetch the summary for
 * @param enabled - Condition to enable/disable the query (default: true)
 * @returns Query result containing the client summary, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data: summary, isLoading } = useClientSummary(123);
 *
 * @example
 * // With conditional fetching
 * const { data: summary } = useClientSummary(clientId, !!clientId);
 *
 * @example
 * // With error handling
 * const { data, error, refetch } = useClientSummary(clientId);
 *
 * if (error) {
 *   return <div>Error loading summary: {error.message}</div>;
 * }
 *
 * @example
 * // Display summary counts
 * const { data: summary } = useClientSummary(clientId);
 * return (
 *   <div>
 *     <p>Opportunities: {summary?.opportunitiesCount || 0}</p>
 *     <p>Quotes: {summary?.quotesCount || 0}</p>
 *   </div>
 * );
 */
export const useClientSummary = (clientId: number | null | undefined, enabled: boolean = true) => {
  return useQuery<ClientSummary, AxiosError>({
    queryKey: ['client-summary', clientId],
    queryFn: async () => {
      if (!clientId || clientId <= 0) {
        throw new Error('Client ID is required');
      }
      return await clientService.getClientSummary(clientId);
    },
    enabled: enabled && !!clientId && clientId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};