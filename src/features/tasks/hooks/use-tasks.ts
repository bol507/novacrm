
import { useQuery } from '@tanstack/react-query';
import type { Task, TaskFilters } from '../types/task';
import { activitiesService } from '../services/activities-service';

export interface TasksResponse {
  data: Task[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    total_pages: number;
    has_more: boolean;
  };
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
  };
}

/**
 * Hook for fetching paginated tasks with filtering.
 *
 * Features:
 * - Pagination support (page, limit)
 * - Filter by status, priority, user, date range, etc.
 * - Built-in caching and stale time management
 * - Stats including totals, completed, pending, overdue, and high priority counts
 *
 * @param page - Page number (1-indexed, default: 1)
 * @param limit - Items per page (default: 20)
 * @param filters - Optional filters for tasks (status, priority, assignedUserId, etc.)
 * @returns Query result containing tasks data, stats, loading state, and error state
 *
 * @example
 * // Basic pagination
 * const { data, isLoading } = useTasks(1, 20);
 *
 * @example
 * // With filters
 * const { data } = useTasks(1, 20, {
 *   status: 'In Progress',
 *   priority: 'High',
 *   assignedUserId: 5
 * });
 *
 * @example
 * // With date range filter
 * const { data } = useTasks(1, 20, {
 *   dueDateFrom: '2026-01-01',
 *   dueDateTo: '2026-12-31'
 * });
 */
export const useTasks = (
  page: number = 1,
  limit: number = 20,
  filters?: TaskFilters
) => {
  return useQuery<TasksResponse>({
    queryKey: ['tasks', page, limit, filters],
    queryFn: async () => {
      const response = await activitiesService.getActivities(page, limit, filters);
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: page > 0 && limit > 0,
  });
};