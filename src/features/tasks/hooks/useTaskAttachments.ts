import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { Attachment, AttachmentResponse, UploadAttachmentPayload } from '../types/task';

/**
 * Hook for fetching attachments of a specific task.
 *
 * Provides automatic caching, stale time management, and retry logic.
 * The query is only enabled when a valid taskId is provided.
 *
 * @param taskId - ID of the task to fetch attachments for
 * @returns Query result containing attachments data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data, isLoading } = useTaskAttachments(123);
 *
 * @example
 * // With conditional fetching
 * const { data } = useTaskAttachments(taskId, {
 *   enabled: !!taskId
 * });
 */
export const useTaskAttachments = (taskId: number) => {
  return useQuery<AttachmentResponse>({
    queryKey: ['tasks', taskId, 'attachments'],
    queryFn: async () => {
      const response = await apiClient.get<AttachmentResponse>(
        `/tasks/${taskId}/attachments`
      );
      return response.data;
    },
    enabled: !!taskId && taskId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Hook for uploading an attachment to a task.
 *
 * Provides optimistic cache invalidation on success to refresh the attachments list.
 * Uploads files using multipart/form-data format.
 *
 * @param taskId - ID of the task to upload the attachment to
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const uploadAttachment = useUploadAttachment(123);
 *
 * const handleFileUpload = async (file: File) => {
 *   await uploadAttachment.mutateAsync({
 *     file,
 *     description: 'Project screenshot'
 *   });
 * };
 *
 * @example
 * // With loading state
 * <Button
 *   onClick={() => uploadAttachment.mutate({ file })}
 *   disabled={uploadAttachment.isPending}
 * >
 *   {uploadAttachment.isPending ? 'Uploading...' : 'Upload'}
 * </Button>
 */
export const useUploadAttachment = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadAttachmentPayload) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.description?.trim()) {
        formData.append('description', payload.description.trim());
      }

      const response = await apiClient.post<{ data: Attachment }>(
        `/tasks/${taskId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
    },
    onError: (error: any) => {
      console.error('Error uploading attachment:', error);
    },
  });
};

/**
 * Hook for deleting an attachment from a task.
 *
 * Provides optimistic cache invalidation on success to refresh the attachments list.
 *
 * @param taskId - ID of the task containing the attachment to delete
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const deleteAttachment = useDeleteAttachment(123);
 *
 * const handleDelete = async (attachmentId: number) => {
 *   await deleteAttachment.mutateAsync(attachmentId);
 * };
 *
 * @example
 * // With confirmation
 * const handleDelete = (attachmentId: number) => {
 *   if (confirm('Are you sure you want to delete this attachment?')) {
 *     deleteAttachment.mutate(attachmentId);
 *   }
 * };
 */
export const useDeleteAttachment = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: number) => {
      await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
    },
    onError: (error: any) => {
      console.error('Error deleting attachment:', error);
    },
  });
};
