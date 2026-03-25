import apiClient from '@/shared/lib/axios';
import type { Attachment } from '../types/attachement';

export const attachmentService = {
  /**
   * Uploads a file attachment.
   *
   * @param module - Module name (e.g., 'project', 'client', 'quote')
   * @param recordId - ID of the record to attach the file to
   * @param file - File object to upload
   * @param description - Optional description of the attachment
   * @returns Promise resolving to the created attachment metadata
   *
   * @throws {AxiosError} If upload fails or validation errors occur
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
   * Retrieves all attachments for a specific record.
   *
   * @param module - Module name (e.g., 'project', 'client', 'quote')
   * @param recordId - ID of the record to fetch attachments for
   * @returns Promise resolving to an array of attachment metadata
   *
   * @throws {AxiosError} If the request fails
   */
  getAttachments: async (module: string, recordId: number): Promise<Attachment[]> => {
    const response = await apiClient.get(`/attachments/${module}/${recordId}`);
    return response.data.data;
  },

  /**
   * Deletes an attachment by its ID.
   *
   * @param attachmentId - ID of the attachment to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @throws {AxiosError} If the attachment does not exist or deletion fails
   */
  deleteAttachment: async (attachmentId: number): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },
};