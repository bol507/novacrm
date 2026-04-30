import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import type { Project, ProjectFilters, ProjectResponse } from '../types/projects';
import { projectService } from '../services/projectService';




/**
 * Custom hook for fetching projects with pagination, search, and filtering capabilities.
 * 
 * This hook leverages React Query for efficient data fetching, caching, and state management.
 * It includes parameter validation, error handling, and intelligent retry logic.
 * 
 * @param page - The page number to fetch (1-based index). Defaults to 1.
 * @param limit - The number of results per page. Defaults to 10, clamped between 1 and 100.
 * @param searchTerm - Optional search term for filtering projects by name, number, or client.
 * @param filters - Optional additional filters for refining the query (status, priority, date range, etc.).
 * @param options - Optional React Query configuration options to override default behavior.
 * 
 * @returns A React Query result object containing:
 *   - data: The fetched project response with typed data and metadata
 *   - isLoading: Boolean indicating if data is currently being fetched
 *   - error: AxiosError object if the request failed, null otherwise
 *   - refetch: Function to manually trigger a refetch of the data
 *   - isFetching: Boolean indicating if a fetch is in progress (including background refetches)
 *   - isSuccess: Boolean indicating if the query completed successfully
 *   - isError: Boolean indicating if the query encountered an error
 * 
 * @example
 * // Basic usage with default parameters
 * const { data, isLoading, error } = useProjects();
 * 
 * @example
 * // Usage with pagination and search
 * const { data } = useProjects(2, 20, 'kitchen renovation');
 * 
 * @example
 * // Usage with additional filters and custom React Query options
 * const { data } = useProjects(1, 10, '', { 
 *   status: 'Active',
 *   priority: 'High'
 * }, {
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 *   enabled: userIsAuthenticated
 * });
 * 
 * @example
 * // Using helper hooks for common use cases
 * const { data: activeProjects } = useActiveProjects();
 * const { data: completedProjects } = useCompletedProjects();
 * const { data: clientProjects } = useProjectsByClient(clientId);
 * 
 * @remarks
 * - Parameters are validated and sanitized before being sent to the API
 * - Page numbers less than 1 default to 1
 * - Limit values are clamped between 1 and 100 for performance
 * - Search terms are trimmed to remove leading/trailing whitespace
 * - The query key includes all filter parameters for proper cache invalidation
 * - Failed requests with 4xx/5xx status codes are not retried automatically
 * - Network errors are retried up to 3 times with exponential backoff
 * - Previous data is maintained during background refetches for smooth UX
 * 
 * @see {@link ProjectFilters} for available filter options
 * @see {@link ProjectResponse} for the structure of the API response
 * @see {@link projectService.getProjects} for the underlying API service call
 */
export const useProjects = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  filters?: Partial<ProjectFilters>,
  options?: Omit<
    UseQueryOptions<ProjectResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  
  const validatedPage = useMemo(() => {
    const p = Number(page);
    return Number.isNaN(p) || p < 1 ? 1 : p;
  }, [page]);

  
  const validatedLimit = useMemo(() => {
    const l = Number(limit);
    return Number.isNaN(l) || l < 1 ? 10 : Math.min(100, Math.max(1, l));
  }, [limit]);

  
  const validatedSearchTerm = useMemo(() => {
    const term = searchTerm ?? '';
    return typeof term === 'string' ? term.trim() : '';
  }, [searchTerm]);

  
  const queryFilters = useMemo<ProjectFilters>(() => ({
    page: validatedPage,
    limit: validatedLimit,
    search: validatedSearchTerm || undefined,
    status: filters?.status,
    priority: filters?.priority,
    assignedTo: filters?.assignedTo,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    clientId: filters?.clientId,
    sortBy: filters?.sortBy || 'last_activity',
    sortOrder: filters?.sortOrder || 'DESC',
  }), [validatedPage, validatedLimit, validatedSearchTerm, filters]);

  return useQuery<ProjectResponse, AxiosError>({
    queryKey: ['projects', queryFilters],
    queryFn: async ({ signal }) => {
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }
      
      try {
        const response = await projectService.getProjects(queryFilters, signal);
        return response;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request cancelled by user');
        }
        throw error;
      }
    },
    
    
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData: ProjectResponse | undefined) => previousData,

    initialData: () => {
      return undefined;
    },
    
    
    retry: (failureCount, error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status && error.response.status >= 400) {
          return false;
        }
        return failureCount < 3;
      }
      return failureCount < 3;
    },
    
    
    enabled: validatedPage > 0 && validatedLimit > 0,
    
    
    ...options,
  });
};

/**
 * Helper hook for fetching only active (in-progress) projects.
 * 
 * This is a convenience wrapper around useProjects that pre-configures
 * the status filter to exclude completed and cancelled projects.
 * 
 * @param page - The page number to fetch (1-based index). Defaults to 1.
 * @param limit - The number of results per page. Defaults to 10.
 * @param searchTerm - Optional search term for filtering active projects.
 * 
 * @returns A React Query result object containing active projects only.
 * 
 * @example
 * const { data: activeProjects } = useActiveProjects(1, 20);
 * 
 * @see {@link useProjects} for the base hook implementation
 */
export const useActiveProjects = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ''
) => {
  return useProjects(page, limit, searchTerm, {
    status: 'Active', 
  });
};

/**
 * Helper hook for fetching only completed projects.
 * 
 * This is a convenience wrapper around useProjects that pre-configures
 * the status filter to include only projects with "Completed" status.
 * 
 * @param page - The page number to fetch (1-based index). Defaults to 1.
 * @param limit - The number of results per page. Defaults to 10.
 * @param searchTerm - Optional search term for filtering completed projects.
 * 
 * @returns A React Query result object containing completed projects only.
 * 
 * @example
 * const { data: completedProjects } = useCompletedProjects();
 * 
 * @see {@link useProjects} for the base hook implementation
 */
export const useCompletedProjects = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ''
) => {
  return useProjects(page, limit, searchTerm, {
    status: 'Completed',
  });
};

/**
 * Helper hook for fetching projects associated with a specific client.
 * 
 * This is a convenience wrapper around useProjects that pre-configures
 * the clientId filter to scope results to a single customer account.
 * 
 * @param clientId - The unique identifier of the client/account to filter by.
 * @param page - The page number to fetch (1-based index). Defaults to 1.
 * @param limit - The number of results per page. Defaults to 10.
 * @param searchTerm - Optional search term for filtering client projects.
 * 
 * @returns A React Query result object containing projects for the specified client.
 * 
 * @example
 * const { data: clientProjects } = useProjectsByClient(12345);
 * 
 * @see {@link useProjects} for the base hook implementation
 */
export const useProjectsByClient = (
  clientId: number,
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ''
) => {
  return useProjects(page, limit, searchTerm, {
    clientId,
  });
};

/**
 * Selector utility for extracting the projects array from a query response.
 * 
 * This function provides type-safe access to the data property while
 * handling undefined responses gracefully by returning an empty array.
 * 
 * @param data - The ProjectResponse object from useProjects, or undefined if not loaded.
 * @returns An array of Project objects, or an empty array if data is undefined.
 * 
 * @example
 * const { data } = useProjects();
 * const projects = selectProjects(data);
 * // projects is typed as Project[] and never undefined
 * 
 * @remarks
 * - Useful for memoized selectors with React Query's select option
 * - Prevents undefined checks in components that consume project lists
 * - Maintains type safety throughout the data flow
 */
export const selectProjects = (data?: ProjectResponse): Project[] => {
  return data?.data || [];
};

/**
 * Selector utility for extracting pagination metadata from a query response.
 * 
 * This function provides normalized pagination information with sensible
 * defaults for each field, making it safe to use in pagination controls
 * without additional null checks.
 * 
 * @param data - The ProjectResponse object from useProjects, or undefined if not loaded.
 * @returns An object containing normalized pagination metadata:
 *   - currentPage: The current page number (default: 1)
 *   - totalPages: The total number of pages available (default: 1)
 *   - totalItems: The total count of items across all pages (default: 0)
 *   - perPage: The number of items displayed per page (default: 10)
 *   - hasNextPage: Boolean indicating if a next page exists
 *   - hasPreviousPage: Boolean indicating if a previous page exists
 * 
 * @example
 * const { data } = useProjects();
 * const pagination = selectPagination(data);
 * 
 * if (pagination.hasNextPage) {
 *   // Render "Next" button
 * }
 * 
 * @remarks
 * - All returned values have safe defaults to prevent undefined access
 * - hasNextPage and hasPreviousPage are computed from currentPage and totalPages
 * - Useful for building reusable pagination components
 */
export const selectPagination = (data?: ProjectResponse) => {
  return {
    currentPage: data?.meta?.current_page || 1,
    totalPages: data?.meta?.last_page || 1,
    totalItems: data?.meta?.total || 0,
    perPage: data?.meta?.per_page || 10,
    hasNextPage: (data?.meta?.current_page || 1) < (data?.meta?.last_page || 1),
    hasPreviousPage: (data?.meta?.current_page || 1) > 1,
  };
};