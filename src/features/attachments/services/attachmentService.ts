import apiClient from '@/shared/lib/axios';
import type { Attachment } from '../types/attachement';

export const attachmentService = {
  /**
   * Subir archivo adjunto
   */
  uploadAttachment: async (
    module: string,
    recordId: number,
    file: File,
    description?: string
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post(
      `/attachments/${module}/${recordId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Listar archivos adjuntos
   */
  getAttachments: async (module: string, recordId: number): Promise<Attachment[]> => {
    const response = await apiClient.get(`/attachments/${module}/${recordId}`);
    return response.data.data;
  },

  /**
   * Eliminar archivo adjunto
   */
  deleteAttachment: async (attachmentId: number): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },
};