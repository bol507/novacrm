// src/features/projects/hooks/use-search-projects.ts

import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { useMemo } from 'react';

export interface ProjectSearchResult {
  id: number;
  projectname: string;
  project_no?: string;
  projectstatus?: string;
  account_name?: string;
}

/**
 * Hook for searching projects with autocomplete functionality.
 *
 * Provides debounced search results for project autocomplete inputs.
 * Returns empty array when search term is empty to avoid unnecessary API calls.
 *
 * @param searchTerm - The search term to filter projects by
 * @param options - Optional configuration for the query
 * @returns Query result containing project search results, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data: projects, isLoading } = useSearchProjects('umbral');
 *
 * @example
 * // With minimum search term length
 * const { data: projects } = useSearchProjects(searchTerm);
 * if (searchTerm.length < 2) return null; // Don't show results
 */
export const useSearchProjects = (
  searchTerm: string,
  options?: {
    minSearchLength?: number;
    enabled?: boolean;
  }
) => {
  const minSearchLength = options?.minSearchLength ?? 2;
  const enabled = options?.enabled ?? searchTerm.length >= minSearchLength;

  return useQuery<ProjectSearchResult[]>({
    queryKey: ['projects-search', searchTerm],
    queryFn: () => projectService.searchProjects(searchTerm),
    enabled,
    staleTime:0, // 5 minutes
    gcTime:  60 * 1000, // 10 minutes
    retry: 1,
    initialData: [],
  });
};