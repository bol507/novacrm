import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { Task, TaskFilters } from '../types/task';

interface TasksResponse {
  data: Task[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    total_pages: number;
  };
}

export const useTasks = (
  page: number = 1,
  limit: number = 20,
  filters?: TaskFilters
) => {
  return useQuery<TasksResponse>({
    queryKey: ['tasks', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        if (filters.status) {
          params.append('status', filters.status.join(','));
        }
        if (filters.priority) {
          params.append('priority', filters.priority.join(','));
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        if (filters.dateFrom) {
          params.append('date_from', filters.dateFrom);
        }
        if (filters.dateTo) {
          params.append('date_to', filters.dateTo);
        }
        if (filters.assignedTo) {
          params.append('assignedTo', filters.assignedTo.toString());
        }
      }

      const response = await apiClient.get<TasksResponse>(`/tasks?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};