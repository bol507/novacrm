import apiClient from '@/shared/lib/axios';

import type { 
  ProjectComment, 
  CommentResponse, 
  CreateCommentData, 
  CommentDetail
} from '@/features/comments/types/comment';

export const commentService = {
  async getCommentById(commentId: number): Promise<CommentDetail> {
    const response = await apiClient.get<CommentDetail>(`/comments/${commentId}`);
    return response.data;
  },

  getComments: async (
    module: string, 
    relatedId: number,
    signal?: AbortSignal
  ): Promise<CommentResponse> => {
    const response = await apiClient.get<CommentResponse>(
      `/comments/${module}/${relatedId}`,
      { signal }
    );
    return response.data;
  },

  createComment: async (
    module: string,
    relatedId: number,
    data: CreateCommentData
  ): Promise<ProjectComment> => {
    const response = await apiClient.post<{ data: ProjectComment }>(
      `/comments/${module}/${relatedId}`,
      data
    );
    return response.data.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};