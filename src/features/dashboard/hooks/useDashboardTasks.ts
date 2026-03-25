import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import apiClient from '@/shared/lib/axios';
import type { DashboardTasksResponse, DashboardTask } from '../types/dashboard';

/**
 * Return type for useDashboardTasks hook
 */
export interface UseDashboardTasksReturn {
  /** Array of dashboard tasks or undefined if loading */
  data: DashboardTasksResponse | undefined;
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if query failed */
  error: AxiosError | null;
  /** Function to manually refetch the query */
  refetch: () => void;
  /** Whether the query is currently fetching data */
  isFetching: boolean;
  /** Whether the query has successfully fetched data at least once */
  isSuccess: boolean;
  /** Whether the query has failed */
  isError: boolean;
}

/**
 * Hook for fetching tasks for the dashboard widget
 * 
 * Retrieves a limited set of recent or pending tasks for display in the
 * dashboard tasks widget. Uses React Query for caching, background updates,
 * and automatic refetching.
 * 
 * @param limit - Maximum number of tasks to fetch (default: 5)
 * @param options - Optional React Query configuration overrides
 * @returns Query result object with tasks data, loading states, and utilities
 * 
 * @example
 * // Basic usage with default limit
 * const { data, isLoading } = useDashboardTasks();
 * 
 * @example
 * // Custom limit with error handling
 * const { data: tasks, error } = useDashboardTasks(10);
 * if (error) {
 *   console.error('Failed to load tasks:', error);
 * }
 * 
 * @example
 * // With custom React Query options
 * const { data } = useDashboardTasks(5, {
 *   enabled: userIsAuthenticated,
 *   retry: 2,
 * });
 * 
 * @remarks
 * - Query key is ['dashboard', 'tasks', limit] for proper cache isolation
 * - Data is considered stale after 2 minutes (staleTime)
 * - Automatic refetch occurs every 5 minutes (refetchInterval) for fresh data
 * - Retries up to 3 times on network errors before failing
 * - Returns DashboardTasksResponse with tasks array and summary statistics
 * - Loading state should be handled by the consuming component
 * - Error handling should display user-friendly messages via toast or UI
 * 
 * @see {@link DashboardTasksResponse} for response data structure
 * @see {@link apiClient} for configured Axios instance
 * @see {@link https://tanstack.com/query/latest/docs/react/useQuery} for React Query documentation
 */
export const useDashboardTasks = (
  limit: number = 5,
  options?: Omit<
    UseQueryOptions<DashboardTasksResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >
): UseDashboardTasksReturn => {
  return useQuery<DashboardTasksResponse, AxiosError>({
    /**
     * Unique query key for caching and invalidation
     * Includes limit parameter to cache different page sizes separately
     */
    queryKey: ['dashboard', 'tasks', limit],

    /**
     * Query function that fetches tasks from the API
     * 
     * @returns Promise resolving to DashboardTasksResponse
     */
    queryFn: async () => {
      const response = await apiClient.get<DashboardTasksResponse>(
        `/dashboard/tasks?limit=${limit}`
      );
      return response.data;
    },

    /**
     * Time in milliseconds before data is considered stale (2 minutes)
     * Shorter than other queries because tasks change frequently
     */
    staleTime: 2 * 60 * 1000,

    /**
     * Automatic refetch interval in milliseconds (5 minutes)
     * Ensures dashboard displays recent task updates without user action
     */
    refetchInterval: 5 * 60 * 1000,

    /**
     * Number of retry attempts for failed queries
     * Only retries on network errors, not HTTP 4xx/5xx responses
     */
    retry: 3,

    /**
     * Merge custom options while preserving required queryKey and queryFn
     */
    ...options,
  });
};

/**
 * Return type for useToggleDashboardTask hook
 */
export interface UseToggleDashboardTaskReturn {
  /** Function to execute the task toggle mutation */
  mutate: (variables: { taskId: number; completed: boolean }) => void;
  /** Async version of mutate for await/async handling */
  mutateAsync: (variables: { taskId: number; completed: boolean }) => Promise<void>;
  /** Whether the mutation is currently executing */
  isPending: boolean;
  /** Error object if mutation failed */
  error: AxiosError | null;
  /** Whether the mutation has successfully completed at least once */
  isSuccess: boolean;
  /** Whether the mutation has failed */
  isError: boolean;
  /** Function to reset mutation state */
  reset: () => void;
}

/**
 * Hook for toggling task completion status from the dashboard widget
 * 
 * Provides a mutation function to update a task's status between
 * 'Completed' and 'In Progress'. Automatically invalidates related
 * queries to ensure dashboard data stays synchronized.
 * 
 * @returns Mutation object with toggle function and state indicators
 * 
 * @example
 * // Basic usage with async/await
 * const toggleTask = useToggleDashboardTask();
 * 
 * const handleToggle = async (taskId: number, currentStatus: boolean) => {
 *   try {
 *     await toggleTask.mutateAsync({
 *       taskId,
 *       completed: !currentStatus,
 *     });
 *     toast.success('Task updated');
 *   } catch (error) {
 *     toast.error('Failed to update task');
 *   }
 * };
 * 
 * @example
 * // Usage with optimistic updates (advanced)
 * const toggleTask = useToggleDashboardTask();
 * 
 * toggleTask.mutate({
 *   taskId: 123,
 *   completed: true,
 * }, {
 *   onMutate: async (variables) => {
 *     // Cancel outgoing refetches to avoid overwriting optimistic update
 *     await queryClient.cancelQueries({ queryKey: ['dashboard', 'tasks'] });
 *     
 *     // Snapshot previous value for rollback if needed
 *     const previousTasks = queryClient.getQueryData(['dashboard', 'tasks']);
 *     
 *     // Optimistically update the UI
 *     queryClient.setQueryData(['dashboard', 'tasks'], (old: any) => ({
 *       ...old,
 *       tasks: old.tasks.map((task: any) =>
 *         task.id === variables.taskId
 *           ? { ...task, status: variables.completed ? 'Completed' : 'In Progress' }
 *           : task
 *       ),
 *     }));
 *     
 *     return { previousTasks };
 *   },
 *   onError: (err, variables, context) => {
 *     // Rollback to previous value on error
 *     queryClient.setQueryData(['dashboard', 'tasks'], context?.previousTasks);
 *   },
 *   onSettled: () => {
 *     // Always refetch after error or success to ensure server state is correct
 *     queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
 *   },
 * });
 * 
 * @remarks
 * - Sends PATCH request to /dashboard/tasks/:taskId with status field
 * - Status is derived from completed boolean: true → 'Completed', false → 'In Progress'
 * - On success, invalidates ['dashboard', 'tasks'] and ['dashboard', 'metrics'] queries
 * - Invalidating metrics ensures task counts and completion rates stay accurate
 * - Errors are logged to console; consuming component should handle user feedback
 * - Mutation state (isPending, isSuccess, isError) should drive UI loading states
 * 
 * @see {@link useDashboardTasks} for the query hook that this mutation complements
 * @see {@link https://tanstack.com/query/latest/docs/react/useMutation} for React Query mutation documentation
 */
export const useToggleDashboardTask = (): UseToggleDashboardTaskReturn => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { taskId: number; completed: boolean }>({
    /**
     * Mutation function that updates task status via API
     * 
     * @param variables - Object containing taskId and desired completion state
     * @param variables.taskId - Unique identifier of the task to update
     * @param variables.completed - Desired completion state (true = Completed, false = In Progress)
     * @returns Promise that resolves when API call completes
     * 
     * @throws AxiosError if API request fails
     */
    mutationFn: async ({ taskId, completed }) => {
      // Map boolean completed flag to API status string
      const status = completed ? 'Completed' : 'In Progress';
      
      await apiClient.patch(`/dashboard/tasks/${taskId}`, { status });
    },

    /**
     * Callback fired on successful mutation
     * 
     * Invalidates related queries to trigger background refetches
     * and ensure dashboard displays updated data.
     * 
     * @param _ - Response data (not used, prefixed with underscore)
     */
    onSuccess: (_) => {
      // Invalidate tasks query to refresh the task list
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
      
      // Invalidate metrics query to update completion counts and rates
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    },

    /**
     * Callback fired on mutation error
     * 
     * Logs error for debugging. Consuming component should
     * display user-friendly error message via toast or UI.
     * 
     * @param error - AxiosError or other error object from failed request
     */
    onError: (error: AxiosError) => {
      console.error('Error updating task status:', error);
    },
  });
};

/**
 * Helper function to extract tasks array from query response
 * 
 * Use with React Query's select option to avoid unnecessary re-renders
 * when only the tasks array is needed (not metadata or loading states).
 * 
 * @param data - Full DashboardTasksResponse from API or undefined
 * @returns Array of tasks or empty array if data is undefined
 * 
 * @example
 * // In useQuery options
 * const {  tasks } = useQuery({
 *   queryKey: ['dashboard', 'tasks'],
 *   queryFn: fetchDashboardTasks,
 *   select: selectDashboardTasks,
 * });
 * 
 * @remarks
 * - Returns empty array instead of undefined for easier consumption
 * - Prevents components from handling undefined data cases
 * - Can be combined with other selectors for derived data
 */
export const selectDashboardTasks = (
  data: DashboardTasksResponse | undefined
): DashboardTask[] => {
  return data?.data || [];
};

/**
 * Helper function to extract task statistics from query response
 * 
 * Use with React Query's select option when only summary metrics
 * are needed for display (e.g., total count, completion rate).
 * 
 * @param data - Full DashboardTasksResponse from API or undefined
 * @returns Statistics object or default values if data is undefined
 * 
 * @example
 * // In a metrics component
 * const {  stats } = useQuery({
 *   queryKey: ['dashboard', 'tasks'],
 *   queryFn: fetchDashboardTasks,
 *   select: selectDashboardTaskStats,
 * });
 */
export const selectDashboardTaskStats = (
   data: DashboardTasksResponse | undefined
) => {
  return {
    /** Total number of tasks */
    totalTasks: data?.stats?.total ?? 0,
    /** Number of completed tasks */
    completedTasks: data?.stats?.completed ?? 0,
    /** Number of pending/incomplete tasks */
    pendingTasks: data?.stats?.pending ?? 0,
    /** Number of overdue tasks */
    overdueTasks: data?.stats?.overdue ?? 0,
    /** Number of high priority tasks */
    highPriorityTasks: data?.stats?.highPriority ?? 0,
  };
};