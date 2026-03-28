import { useQuery } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';

export interface OpportunityFilters {
  /** Filter opportunities by client ID */
  clientId?: number;
  /** Filter opportunities by stage */
  stage?: string;
  /** Filter opportunities by sales stage */
  salesStage?: string;
}

/**
 * Hook for fetching a paginated list of opportunities with optional search and filters.
 *
 * Provides automatic caching, stale time management, and retry logic.
 *
 * @param page - Page number to fetch (default: 1)
 * @param perPage - Number of items per page (default: 20)
 * @param search - Optional search term to filter opportunities by name
 * @param filters - Optional filters for the query
 * @returns Query result containing opportunities data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data, isLoading } = useOpportunities(1, 20);
 *
 * @example
 * // With search term
 * const { data, refetch } = useOpportunities(1, 20, 'project');
 *
 * @example
 * // With client filter
 * const { data } = useOpportunities(1, 20, undefined, { clientId: 123 });
 *
 * @example
 * // With all options
 * const { data } = useOpportunities(1, 20, 'acme', { clientId: 123, salesStage: 'Closed Won' });
 */
export const useOpportunities = (page: number = 1, perPage: number = 20, search?: string, filters?: OpportunityFilters) => {
  
  return useQuery({
    queryKey: ['opportunities', page, perPage, search, filters],
    queryFn: () => opportunityService.getOpportunities(page, perPage, search, filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};