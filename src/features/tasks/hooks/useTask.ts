import { useQuery } from '@tanstack/react-query';
import type { Task } from '../types/task';
import { activitiesService } from '../services/activities-service';

/**
 * Response structure from GET /api/tasks/{id}
 */
interface TaskResponse {
  data: Task;
}

/**
 * Hook para obtener una tarea específica por ID
 * 
 * @param taskId ID de la tarea
 * @returns Query result con la tarea
 */
export const useTask = (taskId: number) => {
  return useQuery<TaskResponse>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await activitiesService.getActivity(taskId);
      return response.data;
    },
    enabled: !!taskId && taskId > 0,
    staleTime: 0, 
  });
};