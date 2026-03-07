import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { Attachment, AttachmentResponse, UploadAttachmentPayload } from '../types/task';

/**
 * Hook para obtener adjuntos de una tarea específica
 * 
 * @param taskId ID de la tarea
 * @returns Query result con lista de adjuntos
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};

/**
 * Hook para subir un adjunto a una tarea
 * 
 * @param taskId ID de la tarea
 * @returns Mutation para subir archivo
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
          },
          onUploadProgress: (progressEvent) => {
            // Opcional: manejar progreso de subida
            const percentCompleted = progressEvent.total 
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidar cache para refrescar lista de adjuntos
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
    },
    onError: (error: any) => {
      console.error('Error uploading attachment:', error);
    },
  });
};

/**
 * Hook para eliminar un adjunto
 * 
 * @param taskId ID de la tarea
 * @returns Mutation para eliminar archivo
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