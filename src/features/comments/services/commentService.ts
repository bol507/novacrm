import apiClient from '@/shared/lib/axios';

import type {
  CommentDetail,
  CommentResponse,
  ProjectComment
} from '@/features/comments/types/comment';
import type { ApiDataResponse } from '@/shared/types/api-response';

type PaginatedApiResponse<T> = {
  message?: string;
  data: {
    data: T[];
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more: boolean;
    };
  };
};



export const commentService = {

  /**
   * Get comments for a related record with pagination and sorting
   * 
   * @param module - Module type (e.g., 'Project', 'Quotes')
   * @param relatedId - ID of the related record
   * @param params - Optional URL query parameters object
   * @param signal - Optional AbortSignal for request cancellation
   */
  getComments: async (
    module: string,
    relatedId: number,
    params?: Record<string, string | number> | URLSearchParams | string,
    signal?: AbortSignal
  ): Promise<CommentResponse> => {

    let url = `/comments/${module}/${relatedId}`;

    if (params) {
      const queryString = params instanceof URLSearchParams
        ? params.toString()
        : params instanceof Object
          ? new URLSearchParams(params as Record<string, string>).toString()
          : params;

      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }

    const response = await apiClient.get<PaginatedApiResponse<ProjectComment>>(
      url,
      {
        signal,
        validateStatus: (status) => status >= 200 && status < 300,
      }
    );

    return response.data.data;
  },

  /**
   * Get a single comment by ID
   */
  getCommentById: async (
    commentId: number,
    signal?: AbortSignal
  ): Promise<CommentDetail> => {
    const url = `/comments/${commentId}`;

    const response = await apiClient.get<CommentDetail>(url, { 
        signal,
        validateStatus: (status) => status >= 200 && status < 300,
      });
    const comment = response.data;
    return comment;
  },


  /**
   * Create a new comment
   */
  createComment: async (
    module: string,
    relatedId: number,
    { content, reasonToEdit }: { content: string; reasonToEdit?: string },
    signal?: AbortSignal
  ): Promise<Comment> => {
    const url = `/comments/${module}/${relatedId}`;

    const response = await apiClient.post<ApiDataResponse<Comment>>(
      url,
      {
        content,
        reason_to_edit: reasonToEdit, // ✅ Convertir camelCase → snake_case
      },
      { signal }
    );

    return response.data.data;
  },

  /**
   * Update an existing comment
   */
  updateComment: async (
    module: string,
    relatedId: number,
    commentId: number,
    { content, reasonToEdit }: { content: string; reasonToEdit?: string },
    signal?: AbortSignal
  ): Promise<void> => {
    const url = `/comments/${module}/${relatedId}/${commentId}`;

    await apiClient.patch<ApiDataResponse<void>>(
      url,
      {
        content,
        reason_to_edit: reasonToEdit,
      },
      { signal }
    );
  },

  /**
   * Delete a comment (soft delete)
   */
  deleteComment: async (
    commentId: number,
    signal?: AbortSignal
  ): Promise<void> => {
    const url = `/comments/${commentId}`;
    await apiClient.delete<ApiDataResponse<void>>(url, { signal });
  },
};