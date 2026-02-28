import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { toast } from 'sonner';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => projectService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar el proyecto');
    },
  });
};