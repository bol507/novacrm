import apiClient from '@/shared/lib/axios';
import type { GlobalSearchResponse } from '../types/search.types';

export const searchService = {
  /**
   * Performs a global search across multiple entity types.
   *
   * Searches projects, clients, opportunities, quotes, tasks, and contacts
   * that match the provided query string. The search is case-insensitive
   * and performs partial matching on relevant fields.
   *
   * @param query - The search query string (minimum 3 characters recommended)
   * @param limit - Maximum number of results to return per entity type. Defaults to 10
   * @returns Promise resolving to grouped search results with total count
   *
   * @example
   * // Search for "acme" across all entities
   * const results = await searchService.globalSearch('acme', 10);
   *
   * @example
   * // Search with empty query returns empty results without API call
   * const emptyResults = await searchService.globalSearch('');
   * // emptyResults.total === 0
   *
   * @throws {AxiosError} If the network request fails or the server returns an error
   */
  async globalSearch(query: string, limit: number = 10): Promise<GlobalSearchResponse> {
    if (!query || query.trim().length === 0) {
      console.error('searchService: Empty query received');
      return {
        results: {
          projects: [],
          clients: [],
          opportunities: [],
          quotes: [],
          tasks: [],
          contacts: [],
        },
        total: 0,
        query: query,
      };
    }

    const trimmedQuery = query.trim();
    

    const response = await apiClient.get<GlobalSearchResponse>('/search/global', {
      params: { 
        query: trimmedQuery, 
        limit 
      },
    });
    
    return response.data;
  },
};