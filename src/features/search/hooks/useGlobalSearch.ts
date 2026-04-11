import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { searchService } from '../services/searchService';
import type { GlobalSearchResponse, SearchResultsByModule } from '../types/search.types';
import { transformSearchResults } from '../utils/transformSearchResults';

interface UseGlobalSearchOptions {
  limit?: number;
  enabled?: boolean;
}

/**
 * Custom hook for managing global search state and operations.
 *
 * Provides search functionality with input validation, query caching, and
 * results management. The search is only triggered when the query string
 * has at least 3 non-space characters and the search panel is open.
 *
 * @param options - Configuration options for the search hook
 * @param options.limit - Maximum number of results to return per category. Defaults to 10
 * @param options.enabled - Whether the search functionality is enabled globally. Defaults to true
 * @returns Search state and control functions
 */
export const useGlobalSearch = (options: UseGlobalSearchOptions = {}) => {
  const {
    limit = 10,
    enabled = true,

  } = options;

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  //const _debouncedQuery = useDebounce(searchQuery, debounceMs);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<GlobalSearchResponse, AxiosError>({
    queryKey: ['global-search', searchQuery, limit],
    queryFn: () => searchService.globalSearch(searchQuery, limit),
    enabled: enabled && searchQuery.trim().length >= 3 && isOpen,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  const searchResults: SearchResultsByModule | null = useMemo(() => {
    if (!data?.results || typeof data.results !== 'object') {
      return null;
    }

    try {
      return transformSearchResults(data.results as Record<string, any[]>);
    } catch (transformError) {
      console.error('Failed to transform search results:', transformError);
      return null;  // Fallback seguro
    }
  }, [data]);

  /**
   * Updates the input value without triggering a search.
   *
   * @param newValue - The new input string from the search field
   */
  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
  }, []);

  /**
   * Executes the search using the current input value.
   *
   * Validates that the trimmed input has at least 3 characters before
   * setting the search query and opening the search panel. Does nothing
   * if the input is too short.
   */
  const executeSearch = useCallback(() => {
    const trimmedQuery = inputValue.trim();


    if (trimmedQuery.length >= 3) {
      setSearchQuery(trimmedQuery);
      setIsOpen(true);
    } else {
      console.warn('Query too short (min 3 chars):', trimmedQuery);
    }
  }, [inputValue]);

  /**
   * Clears all search state and removes cached search queries.
   *
   * Resets input value, search query, closes the search panel,
   * and invalidates the search cache.
   */
  const clearSearch = useCallback(() => {
    setInputValue('');
    setSearchQuery('');
    setIsOpen(false);
    queryClient.removeQueries({ queryKey: ['global-search'] });
  }, [queryClient]);

  /**
   * Closes the search panel without clearing the search state.
   */
  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Opens the search panel and executes a search with the current input value.
   *
   * Validates that the trimmed input has at least 3 characters before
   * setting the search query and opening the panel. Does nothing if the
   * input is too short.
   */
  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Calculates the total number of search results across all categories.
   *
   * @returns Sum of all result items from each category, or 0 if no results exist
   */
  const getTotalCount = useCallback(() => {
    if (!searchResults || typeof searchResults !== 'object') {
      return 0;
    }
    const values = Object.values(searchResults).filter(val => Array.isArray(val));
    return values.reduce((sum, arr) => sum + arr.length, 0);
  }, [searchResults]);

  return {
    inputValue,
    searchQuery,
    searchResults,
    isLoading,
    error,
    isOpen,
    getTotalCount,
    setInputValue: handleInputChange,
    executeSearch,
    openSearch,
    setIsOpen,
    clearSearch,
    closeSearch,
    refetch,
  };
};