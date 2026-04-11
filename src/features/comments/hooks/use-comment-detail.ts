import { useQuery } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import type { CommentDetail } from '../types/comment';

interface UseCommentDetailOptions {
  commentId: number | null;
  enabled?: boolean;
}

interface UseCommentDetailResult {
  comment: CommentDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook para obtener detalles de un comentario específico.
 * 
 * Usa React Query para caching y manejo de estados.
 * 
 * @param options Opciones de configuración
 * @returns Resultado con datos del comentario
 * 
 * @example
 * // Uso básico
 * const { comment, isLoading } = useCommentDetail({ commentId: 123 });
 * 
 * @example
 * // Con habilitación condicional
 * const { comment } = useCommentDetail({ 
 *   commentId: selectedCommentId, 
 *   enabled: !!selectedCommentId 
 * });
 */
export const useCommentDetail = (
  options: UseCommentDetailOptions
): UseCommentDetailResult => {
  const { commentId, enabled = true } = options;

  const { data, isLoading, isError, error, refetch } = useQuery<CommentDetail, Error>({
    queryKey: ['comment-detail', commentId],
    queryFn: async () => {
      if (!commentId) {
        throw new Error('Comment ID is required');
      }
      try {
        const result = await commentService.getCommentById(commentId);
        console.log('🔍 CommentDetail hook debug:', {
          commentIdFromUrl: commentId,
          comment: result,
          isLoading,
          isError,
          error: error?.message,
          commentKeys: result ? Object.keys(result) : 'null',
        });
        return result;
      } catch (err) {
        throw err;
      }
    },
    enabled: enabled && commentId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutos - datos frescos
    gcTime: 1000 * 60 * 10,   // 10 minutos - mantener en caché
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isError && error) {
    console.error('🔥 useQuery state: isError=true', {
      message: error.message,
      name: (error as Error).name,
    });
  }

  return {
    comment: data ?? null,
    isLoading,
    isError,
    error,
    refetch,
  };
};