import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { Comment, CommentResponse, CreateCommentPayload } from '../types/task';

/**
 * Hook para obtener comentarios de una tarea específica
 * 
 * @param taskId ID de la tarea
 * @param page Número de página para paginación
 * @param limit Items por página
 */
export const useTaskComments = (taskId: number, page: number = 1, limit: number = 20) => {
  return useQuery<CommentResponse>({
    queryKey: ['tasks', taskId, 'comments', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await apiClient.get<CommentResponse>(
        `/tasks/${taskId}/comments?${params}`
      );
      return response.data;
    },
    enabled: !!taskId, // Solo ejecutar si taskId existe
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

/**
 * Hook para agregar un comentario a una tarea
 */
export const useAddComment = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCommentPayload) => {
      const response = await apiClient.post<{ data: Comment }>(
        `/tasks/${taskId}/comments`,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidar cache de comentarios para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] });
      // También invalidar estadísticas del dashboard si es necesario
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'tasks'] });
    },
    onError: (error: any) => {
      console.error('Error adding comment:', error);
    },
  });
};