import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { CreateTaskPayload, CreateTaskResponse } from '../types/task';

/**
 * Hook for creating a new task
 * 
 * Handles task creation with automatic cache invalidation for related queries.
 * Invalidates task lists, dashboard tasks, and dashboard metrics after successful creation.
 * 
 * @returns Mutation object with mutate, mutateAsync, isLoading, isError, error, etc.
 * 
 * @example
 * // Basic usage
 * const createTask = useCreateTask();
 * 
 * await createTask.mutateAsync({
 *   title: 'New Task',
 *   description: 'Task description',
 *   priority: 'High',
 *   status: 'Not Started',
 *   dueDate: '2026-03-01',
 * });
 * 
 * @example
 * // With success/error handling
 * const { mutateAsync, isLoading, isError, error } = useCreateTask();
 * 
 * try {
 *   await mutateAsync(taskData);
 *   toast.success('Task created successfully');
 * } catch (err) {
 *   toast.error('Failed to create task');
 * }
 * 
 * @remarks
 * - Automatically invalidates ['tasks'] query cache
 * - Automatically invalidates ['dashboard', 'tasks'] query cache
 * - Automatically invalidates ['dashboard', 'metrics'] query cache
 * - Logs errors to console for debugging
 * 
 * @see {@link CreateTaskPayload} for payload structure
 * @see {@link CreateTaskResponse} for response structure
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * Mutation function to create a task via API
     * 
     * @param payload - Task creation data
     * @returns Promise resolving to task creation response
     */
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await apiClient.post<CreateTaskResponse>('/tasks', payload);
      return response.data;
    },

    /**
     * Callback fired on successful task creation
     * 
     * Invalidates related query caches to ensure UI displays fresh data.
     * 
     * @param _data - Task creation response data (unused, prefixed with underscore)
     * 
     * @remarks
     * Invalidates the following query keys:
     * - ['tasks'] - Main task list
     * - ['dashboard', 'tasks'] - Dashboard task widget
     * - ['dashboard', 'metrics'] - Dashboard metrics
     */
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    },

    /**
     * Callback fired on task creation error
     * 
     * @param error - Error object from failed mutation
     * 
     * @remarks
     * - Logs error to console for debugging
     * - Can be extended to show toast notifications or error UI
     */
    onError: (error: any) => {
      console.error('Error creating task:', error);
    },
  });
};