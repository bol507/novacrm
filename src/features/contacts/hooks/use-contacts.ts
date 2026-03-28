import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { contactService } from '../services/contact-service';
import type { Contact, ContactFilters, ContactResponse } from '../types/contact';

/**
 * Hook for fetching a paginated list of contacts with optional filters.
 *
 * Provides automatic caching, stale time management, and retry logic.
 * The query is only enabled when page and limit are valid.
 *
 * @param page - Page number to fetch (default: 1)
 * @param limit - Number of items per page (default: 20, max: 100)
 * @param searchTerm - Optional search term to filter contacts by name or email
 * @param filters - Optional filters for the query (accountId, assignedTo, status, etc.)
 * @param options - Optional React Query configuration overrides
 * @returns Query result containing contacts data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data, isLoading } = useContacts(1, 20);
 *
 * @example
 * // With search and filters
 * const { data } = useContacts(1, 20, 'John', {
 *   accountId: 123,
 *   status: 'Active'
 * });
 *
 * @example
 * // With custom query options
 * const { data, refetch } = useContacts(1, 20, '', {}, {
 *   enabled: isEnabled,
 *   staleTime: 30000
 * });
 */
export const useContacts = (
  page: number = 1,
  limit: number = 20,
  searchTerm: string = '',
  filters?: Partial<ContactFilters>,
  options?: Omit<UseQueryOptions<ContactResponse, AxiosError>, 'queryKey' | 'queryFn'>
) => {
  const validatedPage = useMemo(() => Math.max(1, page), [page]);
  const validatedLimit = useMemo(() => Math.min(100, Math.max(1, limit)), [limit]);
  const validatedSearchTerm = useMemo(() => searchTerm.trim(), [searchTerm]);

  const queryFilters = useMemo<ContactFilters>(() => ({
    page: validatedPage,
    limit: validatedLimit,
    search: validatedSearchTerm || undefined,
    accountId: filters?.accountId,
    assignedTo: filters?.assignedTo,
    status: filters?.status,
    sortBy: filters?.sortBy || 'lastname',
    sortOrder: filters?.sortOrder || 'ASC',
  }), [validatedPage, validatedLimit, validatedSearchTerm, filters]);

  return useQuery<ContactResponse, AxiosError>({
    queryKey: ['contacts', queryFilters],
    queryFn: async ({ signal }) => {
      if (signal?.aborted) throw new Error('Request cancelled');
      return await contactService.getContacts(queryFilters);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;       
        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    enabled: validatedPage > 0 && validatedLimit > 0,
    ...options,
  });
};

/**
 * Hook helper for fetching contacts associated with a specific account.
 *
 * @param accountId - The ID of the account to fetch contacts for
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 20)
 * @returns Query result containing contacts data for the account
 *
 * @example
 * const { data: contacts, isLoading } = useContactsByAccount(123);
 *
 * @example
 * // With pagination
 * const { data } = useContactsByAccount(123, 2, 10);
 */
export const useContactsByAccount = (
  accountId: number,
  page: number = 1,
  limit: number = 20
) => {
  return useContacts(page, limit, '', { accountId });
};

/**
 * Selector function to extract contacts array from the response.
 *
 * @param data - The full contact response object
 * @returns Array of contacts, or empty array if no data
 *
 * @example
 * const { data } = useContacts(1, 20);
 * const contacts = selectContacts(data);
 */
export const selectContacts = (data?: ContactResponse): Contact[] => {
  return data?.data || [];
};

/**
 * Selector function to extract pagination metadata from the response.
 *
 * @param data - The full contact response object
 * @returns Pagination metadata including current page, total pages, total items, and next page flag
 *
 * @example
 * const { data } = useContacts(1, 20);
 * const { currentPage, totalPages, hasNextPage } = selectContactPagination(data);
 *
 * if (hasNextPage) {
 *   loadMore();
 * }
 */
export const selectContactPagination = (data?: ContactResponse) => {
  return {
    /** Current page number */
    currentPage: data?.meta?.current_page || 1,
    /** Total number of pages */
    totalPages: data?.meta?.last_page || 1,
    /** Total number of items across all pages */
    totalItems: data?.meta?.total || 0,
    /** Whether there is a next page available */
    hasNextPage: (data?.meta?.current_page || 1) < (data?.meta?.last_page || 1),
  };
};