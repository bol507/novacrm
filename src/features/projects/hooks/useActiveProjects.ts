import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import type { ProjectFilters } from '../types/projects';

export const useActiveProjects = (page: number, limit: number, searchTerm: string) => {
  return useQuery({
    queryKey: ['active-projects', page, limit, searchTerm],
    queryFn: async () => {
      const filters: ProjectFilters = {
        page,
        limit,
        search: searchTerm || undefined,
        status: 'active', 
      };
      return await projectService.getProjects(filters);
    },
    staleTime: 5 * 60 * 1000, 
    placeholderData: (previousData) => previousData,
  });
};