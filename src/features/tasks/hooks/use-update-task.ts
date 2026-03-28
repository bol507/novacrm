import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { UpdateTaskRequest, Task } from '../types/task';

/**
 * Payload for updating a task.
 * Includes the taskId for the URL and the fields to update in the body.
 */
export interface UpdateTaskPayload extends UpdateTaskRequest {
  /** ID of the task to update */
  taskId: number;
}

/**
 * Hook for updating an existing task.
 *
 * Provides mutation functionality to update a task by ID with the given payload.
 * The taskId is extracted from the payload for the URL, while the remaining fields
 * are sent in the request body. On success, invalidates the specific task query,
 * the tasks list query, and dashboard queries to trigger refetching.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const updateTask = useUpdateTask();
 *
 * const handleUpdate = async () => {
 *   await updateTask.mutateAsync({
 *     taskId: 123,
 *     subject: 'New title',
 *     status: 'Completed'
 *   });
 * };
 *
 * @example
 * // With form data
 * const updateTask = useUpdateTask();
 *
 * const handleSubmit = async (formData: UpdateTaskRequest, taskId: number) => {
 *   await updateTask.mutateAsync({ taskId, ...formData });
 * };
 *
 * @example
 * // With loading state
 * const updateTask = useUpdateTask();
 *
 * <Button
 *   onClick={() => updateTask.mutate({ taskId: 123, status: 'In Progress' })}
 *   disabled={updateTask.isPending}
 * >
 *   {updateTask.isPending ? 'Updating...' : 'Update Task'}
 * </Button>
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateTaskPayload>({
    mutationFn: async ({ taskId, ...payload }: UpdateTaskPayload) => {
      const response = await apiClient.patch<{ message: string; data: Task }>(
        `/tasks/${taskId}`,
        payload
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    },
    onError: (error: any) => {
      console.error('Error updating task:', error);
    },
  });
};