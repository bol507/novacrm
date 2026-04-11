import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { Quote, QuoteResponse } from '../types/quote';
import { quoteService } from '../services/quoteService';

export interface QuoteFilters {
  clientId?: number;
  stage?: string;
  status?: string;
}


/**
 * Custom hook for fetching quotes with pagination and search
 * 
 * Uses React Query for data fetching, caching, and background updates.
 * 
 * @param page - Page number for pagination (1-based index)
 * @param perPage - Number of quotes to fetch per page
 * @param search - Optional search term to filter quotes
 * @param options - Optional React Query configuration overrides
 * 
 * @returns React Query result object with quotes data and utilities
 * 
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useQuotes(1, 20);
 * 
 * @example
 * // Access quotes and metadata
 * const { data } = useQuotes(1, 20);
 * const quotes = data?.data || [];
 * const meta = data?.meta;
 */
export const useQuotes = (
  page: number = 1,
  perPage: number = 20,
  search?: string,
  filters?: QuoteFilters
) => {
  
  return useQuery<QuoteResponse, AxiosError>({
    queryKey: ['quotes', page, perPage, search, filters],
    queryFn: () => quoteService.getQuotes(page, perPage, search, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Helper function to extract quotes array from query response
 * 
 * @param data - Query result data
 * @returns Array of quotes or empty array
 * 
 * @example
 * const { data } = useQuotes(1, 20);
 * const quotes = getQuotesData(data);
 */
export const getQuotesData = (data: QuoteResponse | undefined): Quote[] => {
  return data?.data || [];
};

/**
 * Helper function to extract pagination metadata from query response
 * 
 * @param data - Query result data
 * @returns Pagination metadata or default values
 * 
 * @example
 * const { data } = useQuotes(1, 20);
 * const meta = getQuotesMeta(data);
 */
export const getQuotesMeta = (data: QuoteResponse | undefined) => {
  return {
    currentPage: data?.meta?.current_page || 1,
    totalPages: data?.meta?.last_page || 1,
    totalItems: data?.meta?.total || 0,
    perPage: data?.meta?.per_page || 20,
    hasNextPage: (data?.meta?.current_page || 1) < (data?.meta?.last_page || 1),
    hasPreviousPage: (data?.meta?.current_page || 1) > 1,
  };
};