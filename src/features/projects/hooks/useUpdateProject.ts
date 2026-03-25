import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService} from '../services/projectService';
import { toast } from 'sonner';
import type { ProjectUpdateData } from '../types/projects';

/**
 * Hook for updating an existing project.
 *
 * Provides a mutation function to update a project with the given data.
 * On success, invalidates projects and project queries to trigger refetching
 * and displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const updateProject = useUpdateProject();
 *
 * const handleUpdate = async (projectId: number, data: ProjectUpdateData) => {
 *   await updateProject.mutateAsync({ projectId, data });
 * };
 *
 * @example
 * // With loading state
 * const updateProject = useUpdateProject();
 *
 * <Button
 *   onClick={() => updateProject.mutate({ projectId: 123, data })}
 *   disabled={updateProject.isPending}
 * >
 *   {updateProject.isPending ? 'Saving...' : 'Save Changes'}
 * </Button>
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: ProjectUpdateData }) => 
      projectService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error updating project');
    },
  });
};