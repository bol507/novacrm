import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

export const useProjectDetail = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(Number(projectId)),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 mins
  });
};