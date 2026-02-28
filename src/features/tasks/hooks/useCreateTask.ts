import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { CreateTaskRequest, Task } from '../types/task';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const response = await apiClient.post<Task>('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
    },
  });
};