import { useQuery } from "@tanstack/react-query";
import { projectService } from "../services/projectService";

export const useProjectName = (projectId: number | null) => {
  return useQuery<string | null>({
    queryKey: ['project-name', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const project = await projectService.getProjectById(projectId);
      return project.projectname || null;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, 
    retry: 1,
  });
};