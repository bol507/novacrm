import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService} from '../services/projectService';
import { toast } from 'sonner';
import type { CreateProjectData } from '../types/projects';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
       queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      toast.success('Proyecto creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear el proyecto');
    },
  });
};