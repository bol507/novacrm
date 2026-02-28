import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { DashboardTasksResponse, DashboardTask } from '../types/dashboard';

/**
 * Hook para obtener tareas del widget del dashboard
 * 
 * @param limit - Número máximo de tareas (default: 5)
 * @returns Query result con tareas y estadísticas
 */
export const useDashboardTasks = (limit: number = 5) => {
  return useQuery<DashboardTasksResponse>({
    queryKey: ['dashboard', 'tasks', limit],
    queryFn: async () => {
      const response = await apiClient.get<DashboardTasksResponse>(
        `/dashboard/tasks?limit=${limit}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos para tareas (más frecuente)
    refetchInterval: 5 * 60 * 1000, // Refetch automático cada 5 min
    retry: 3,
  });
};

/**
 * Hook para actualizar estado de tarea desde el dashboard
 */
export const useToggleDashboardTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      const status = completed ? 'Completed' : 'In Progress';
      await apiClient.patch(`/dashboard/tasks/${taskId}`, { status });
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    },
    onError: (error: any) => {
      console.error('Error updating task:', error);
    },
  });
};