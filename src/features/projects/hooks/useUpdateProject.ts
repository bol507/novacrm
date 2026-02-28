import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService} from '../services/projectService';
import { toast } from 'sonner';
import type { UpdateProjectData } from '../types/projects';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: UpdateProjectData }) => 
      projectService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Proyecto actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar el proyecto');
    },
  });
};