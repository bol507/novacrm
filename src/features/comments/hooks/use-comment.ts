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
      toast.success('Comentario agregado exitosamente');
    },
    
    onError: (error: AxiosError) => {
      
      const errorMessage = 
        error.response?.data && 
        typeof error.response.data === 'object' && 
        'error' in error.response.data 
          ? (error.response.data as { error?: string }).error 
          : undefined;
      
      toast.error(errorMessage || 'Error al agregar comentario');
    },
  });
};

// ✅ Actualizar selectores
export const selectComments = (response?: CommentResponse): ProjectComment[] => {
  return response?.data ?? [];
};

export const selectCommentsMeta = (response?: CommentResponse) => {
  return response?.meta ?? {
    current_page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
    has_more: false,
  };
};