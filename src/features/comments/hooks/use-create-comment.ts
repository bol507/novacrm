import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/shared/lib/api-error-handler';
import apiClient from '@/shared/lib/axios';
import type { ApiErrorResponse } from '@/shared/types/api-error';
import type { ProjectComment } from '../types/comment';
import type { ApiDataResponse } from '@/shared/types/api-response';

/**
 * Payload for creating a new comment.
 */
export interface CreateCommentData {
  /** Comment content text */
  content: string;
  /** Optional reason for editing (used when editing an existing comment) */
  reasonToEdit?: string;
  /** ID of the parent comment (for threaded replies) */
  parentCommentId?: number;
}

/**
 * Hook for creating a new comment on a record.
 *
 * Provides mutation functionality to create a comment for a specific module and record.
 * On success, invalidates the comments query to refresh the list and shows a success toast.
 * On error, displays an error toast with the appropriate error message.
 *
 * @param module - Module name (e.g., 'Project', 'Quotes', 'Calendar')
 * @param relatedId - ID of the related record to attach the comment to
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const createComment = useCreateComment('Project', 123);
 *
 * const handleSubmit = async (content: string) => {
 *   await createComment.mutateAsync({ content });
 * };
 *
 * @example
 * // With loading state
 * const createComment = useCreateComment('Project', 123);
 *
 * <Button
 *   onClick={() => createComment.mutate({ content: commentText })}
 *   disabled={createComment.isPending}
 * >
 *   {createComment.isPending ? 'Posting...' : 'Post Comment'}
 * </Button>
 *
 * @example
 * // With optimistic update
 * const createComment = useCreateComment('Project', 123);
 *
 * const handleSubmit = async (content: string) => {
 *   await createComment.mutateAsync({ content }, {
 *     onSuccess: () => {
 *       // Additional success handling
 *       scrollToBottom();
 *     }
 *   });
 * };
 */
export const useCreateComment = (module: string, relatedId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectComment,
    AxiosError<ApiErrorResponse>,
    CreateCommentData
  >({
    mutationFn: async (data: CreateCommentData) => {
      const url = `/comments/${module}/${relatedId}`;
      
      const response = await apiClient.post<ApiDataResponse<ProjectComment>>(
        url,
        {
          content: data.content,
          reason_to_edit: data.reasonToEdit,
          parent_comment_id: data.parentCommentId,
        },
        {
          validateStatus: (status) => status >= 200 && status < 300,
        }
      );
      
      return response.data.data;
    },
    
    onSuccess: (_newComment) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', module, relatedId] 
      });
      
      toast.success('Comment added successfully');
    },
    
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(getApiErrorMessage(error, 'Error adding comment'));
    },
  });
};