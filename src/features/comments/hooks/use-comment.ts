import { commentService } from '@/features/comments/services/commentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { 
  ProjectComment, 
  CommentResponse, 
  CreateCommentData
} from '@/features/comments/types/comment';

import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Hook for fetching comments for a specific module and record.
 *
 * Provides automatic caching, stale time management, and pagination support.
 * The query is only enabled when both module and relatedId are valid.
 *
 * @param module - Module name (e.g., 'project', 'task')
 * @param relatedId - ID of the record to fetch comments for
 * @param options - Optional React Query configuration overrides
 * @returns Query result containing comments data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data, isLoading } = useComments('project', 123);
 *
 * @example
 * // With custom options
 * const { data, refetch } = useComments('project', 123, {
 *   enabled: isProjectLoaded,
 *   staleTime: 5000
 * });
 */
export const useComments = (
  module: string,
  relatedId: number,
  options?: Omit<UseQueryOptions<CommentResponse, AxiosError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CommentResponse, AxiosError>({
    queryKey: ['comments', module, relatedId],
    queryFn: async ({ signal }) => {
      if (signal?.aborted) throw new Error('Request cancelled');
      return await commentService.getComments(module, relatedId, signal);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    enabled: !!module && relatedId > 0,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status && error.response.status >= 400) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};

/**
 * Hook for creating a new comment.
 *
 * Provides optimistic update functionality by immediately adding the new comment
 * to the cache on success. Displays toast notifications for success and error states.
 *
 * @param module - Module name (e.g., 'project', 'task')
 * @param relatedId - ID of the record to attach the comment to
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const createComment = useCreateComment('project', 123);
 *
 * const handleSubmit = (content: string) => {
 *   createComment.mutate({ content });
 * };
 *
 * @example
 * // With loading state
 * <Button onClick={() => createComment.mutate({ content })}
 *         disabled={createComment.isPending}>
 *   {createComment.isPending ? 'Posting...' : 'Post Comment'}
 * </Button>
 */
export const useCreateComment = (module: string, relatedId: number) => {
  const queryClient = useQueryClient();

  return useMutation<ProjectComment, AxiosError, CreateCommentData>({
    mutationFn: (data: CreateCommentData) => 
      commentService.createComment(module, relatedId, data),
    
    onSuccess: (newComment) => {
      queryClient.setQueryData<CommentResponse>(
        ['comments', module, relatedId],
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            data: [newComment, ...old.data],
            meta: { 
              ...old.meta, 
              total: old.meta.total + 1 
            },
          };
        }
      );
      toast.success('Comment added successfully');
    },
    
    onError: (error: AxiosError) => {
      const errorMessage = 
        error.response?.data && 
        typeof error.response.data === 'object' && 
        'error' in error.response.data 
          ? (error.response.data as { error?: string }).error 
          : undefined;
      
      toast.error(errorMessage || 'Error adding comment');
    },
  });
};

/**
 * Selector function to extract comments array from the response.
 *
 * @param response - The full comment response object
 * @returns Array of project comments
 *
 * @example
 * const { data } = useComments('project', 123);
 * const comments = selectComments(data);
 */
export const selectComments = (response?: CommentResponse): ProjectComment[] => {
  return response?.data ?? [];
};

/**
 * Selector function to extract pagination metadata from the response.
 *
 * @param response - The full comment response object
 * @returns Pagination metadata including current page, total items, etc.
 *
 * @example
 * const { data } = useComments('project', 123);
 * const meta = selectCommentsMeta(data);
 */
export const selectCommentsMeta = (response?: CommentResponse) => {
  return response?.meta ?? {
    current_page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
    has_more: false,
  };
};

/**
 * Hook for deleting a comment.
 *
 * Provides optimistic update functionality by removing the deleted comment
 * from all cached comment queries. Displays toast notifications for success
 * and error states.
 *
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const deleteComment = useDeleteComment();
 *
 * const handleDelete = (commentId: number) => {
 *   deleteComment.mutate(commentId);
 * };
 *
 * @example
 * // With loading state
 * <Button
 *   onClick={() => deleteComment.mutate(commentId)}
 *   disabled={deleteComment.isPending}
 * >
 *   {deleteComment.isPending ? 'Deleting...' : 'Delete'}
 * </Button>
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, number>({
    mutationFn: async (commentId: number) => {
      return await commentService.deleteComment(commentId);
    },
    
    onSuccess: (_, deletedCommentId) => {
      queryClient.setQueriesData<CommentResponse>(
        { queryKey: ['comments'] },
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            data: oldData.data.filter(comment => comment.id !== deletedCommentId),
            meta: {
              ...oldData.meta,
              total: oldData.meta.total - 1
            }
          };
        }
      );
      
      toast.success('Comment deleted successfully');
    },
    
    onError: (error: AxiosError) => {
      const errorMessage = 
        error.response?.data && 
        typeof error.response.data === 'object' && 
        'error' in error.response.data 
          ? (error.response.data as { error?: string }).error 
          : undefined;
      
      toast.error(errorMessage || 'Error deleting comment');
    },
  });
};