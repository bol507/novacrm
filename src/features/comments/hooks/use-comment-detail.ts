import { useQuery } from '@tanstack/react-query';
import { commentService} from '../services/commentService';
import type { CommentDetail } from '../types/comment';

interface UseCommentDetailOptions {
  /** ID del comentario a cargar */
  commentId: number | null;
  
  /** Si el hook está habilitado */
  enabled?: boolean;
}

interface UseCommentDetailResult {
  /** Datos del comentario */
  comment: CommentDetail | null;
  
  /** Si está cargando */
  isLoading: boolean;
  
  /** Si hay error */
  isError: boolean;
  
  /** Objeto de error */
  error: Error | null;
  
  /** Función para refrescar */
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
    queryFn: () => {
      if (!commentId) {
        throw new Error('Comment ID is required');
      }
      return commentService.getCommentById(commentId);
    },
    enabled: enabled && commentId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutos - datos frescos
    gcTime: 1000 * 60 * 10,   // 10 minutos - mantener en caché
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    comment: data ?? null,
    isLoading,
    isError,
    error,
    refetch,
  };
};