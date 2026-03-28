import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import { toast } from 'sonner';

/**
 * Hook for deleting a task (soft delete).
 *
 * Provides mutation functionality to delete a task by ID.
 * On success, invalidates the tasks list query, dashboard tasks query, and dashboard metrics query
 * to trigger refetching and keep the UI in sync.
 *
 * @param taskId - ID of the task to delete
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const deleteTask = useDeleteTask(123);
 *
 * const handleDelete = async () => {
 *   await deleteTask.mutateAsync();
 * };
 *
 * @example
 * // With confirmation and loading state
 * const deleteTask = useDeleteTask(taskId);
 *
 * const handleDelete = () => {
 *   if (confirm('Are you sure you want to delete this task?')) {
 *     deleteTask.mutate(undefined, {
 *       onSuccess: () => {
 *         navigate('/tasks');
 *       }
 *     });
 *   }
 * };
 *
 * @example
 * // With loading indicator
 * <Button
 *   onClick={() => deleteTask.mutate()}
 *   disabled={deleteTask.isPending}
 *   variant="destructive"
 * >
 *   {deleteTask.isPending ? 'Deleting...' : 'Delete Task'}
 * </Button>
 */
export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: number) => {  
            const response = await apiClient.delete<{ message: string }>(`/tasks/${taskId}`);
            return response.data;
        },
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
        },
        onError: (error: any) => {
            console.error('Error deleting task:', error);


            if (error.response?.status === 404) {
                toast.error('Tarea no encontrada');
            } else if (error.response?.status === 403) {
                toast.error('No tienes permisos para eliminar esta tarea');
            } else {
                toast.error('Error al eliminar la tarea');
            }
        },
    });
};