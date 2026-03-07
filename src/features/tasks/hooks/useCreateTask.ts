import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { CreateTaskPayload,  CreateTaskResponse,  Task } from '../types/task';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload : CreateTaskPayload) => { 
      const response = await apiClient.post<CreateTaskResponse>('/tasks', payload  );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar cache de listas de tareas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
      
      // Opcional: mostrar notificación de éxito
      // toast.success('Tarea creada correctamente');
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      // El error se maneja en el componente con toast
    },
  });
};