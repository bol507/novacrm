import apiClient from "@/shared/lib/axios";
import type { CreateCommentData } from "../types/comment";

export const commentService = {
  
  getComments: async (module: string, relatedId: number) => {
    const response = await apiClient.get(`/comments/${module}/${relatedId}`);
    return response.data;
  },

  createComment: async (module: string, relatedId: number, data: CreateCommentData) => {
    const response = await apiClient.post(`/comments/${module}/${relatedId}`, data);
    return response.data;
  },
};