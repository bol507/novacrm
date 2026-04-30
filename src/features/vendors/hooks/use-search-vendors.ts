import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../services/vendor-service';

export interface VendorSearchResult {
  id: number;
  vendorname: string;
  email?: string;
  phone?: string;
  category?: string;
}

/**
 * Hook for searching vendors with autocomplete functionality.
 *
 * Provides debounced search results for vendor autocomplete inputs.
 * Returns empty array when search term is empty to avoid unnecessary API calls.
 *
 * @param searchTerm - The search term to filter vendors by
 * @param options - Optional configuration for the query
 * @returns Query result containing vendor search results, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data: vendors, isLoading } = useSearchVendors('canal');
 *
 * @example
 * // With minimum search term length
 * const { data: vendors } = useSearchVendors(searchTerm);
 * if (searchTerm.length < 2) return null; // Don't show results
 */
export const useSearchVendors = (
  searchTerm: string,
  options?: {
    minSearchLength?: number;
    enabled?: boolean;
  }
) => {
  const minSearchLength = options?.minSearchLength ?? 2;

  return useQuery<VendorSearchResult[]>({
    queryKey: ['vendors-search', searchTerm],
    queryFn: async () => {
        const result = await vendorService.searchVendors(searchTerm);
        return result;
    },
    enabled: searchTerm.trim().length >= minSearchLength,
    staleTime:0, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    initialData: [], 
    
  });
};