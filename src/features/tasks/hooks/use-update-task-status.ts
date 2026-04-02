import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { Task } from '../types/task';

/**
 * Payload for updating only the status of a task.
 */
export interface UpdateTaskStatusPayload {
  /** ID of the task to update */
  taskId: number;
  /** New status for the task */
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
}

/**
 * Hook for updating the status of a task.
 *
 * Provides mutation functionality to update a task's status by ID.
 * The taskId is used for the URL, while the status is sent in the request body.
 * On success, invalidates the specific task query, the tasks list query,
 * and dashboard queries to trigger refetching and keep the UI in sync.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const updateStatus = useUpdateTaskStatus();
 *
 * const handleStatusChange = async (newStatus: string) => {
 *   await updateStatus.mutateAsync({
 *     taskId: 123,
 *     status: 'In Progress'
 *   });
 * };
 *
 * @example
 * // With loading state
 * const updateStatus = useUpdateTaskStatus();
 *
 * <Select
 *   value={task.status}
 *   onValueChange={(newStatus) => {
 *     updateStatus.mutate({ taskId: task.id, status: newStatus });
 *   }}
 *   disabled={updateStatus.isPending}
 * >
 *   <SelectItem value="Not Started">Not Started</SelectItem>
 *   <SelectItem value="In Progress">In Progress</SelectItem>
 *   <SelectItem value="Completed">Completed</SelectItem>
 * </Select>
 *
 * @example
 * // With success/error callbacks
 * const updateStatus = useUpdateTaskStatus();
 *
 * const handleStatusChange = (newStatus: string) => {
 *   updateStatus.mutate(
 *     { taskId: 123, status: newStatus },
 *     {
 *       onSuccess: () => {
 *         toast.success('Task status updated');
 *       },
 *       onError: (error) => {
 *         toast.error('Failed to update status');
 *       }
 *     }
 *   );
 * };
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateTaskStatusPayload>({
    mutationFn: async ({ taskId, status }: UpdateTaskStatusPayload) => {
      const response = await apiClient.patch<{ message: string; data: Task }>(
        `/tasks/${taskId}`,
        { status }
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
      console.error('Error updating task status:', error);
    },
  });
};