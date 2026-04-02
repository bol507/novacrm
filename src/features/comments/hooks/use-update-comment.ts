import { getApiErrorMessage } from '@/shared/lib/api-error-handler';
import apiClient from '@/shared/lib/axios';
import type { ApiErrorResponse } from '@/shared/types/api-error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface UpdateCommentData {
  content: string;
  reasonToEdit?: string;
}

export const useUpdateComment = (module: string, relatedId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    void,                                   
    AxiosError<ApiErrorResponse>,           
    { commentId: number;  data:UpdateCommentData }
  >({
    mutationFn: async ({ commentId, data }) => {
      const response = await apiClient.patch(
        `/comments/${module}/${relatedId}/${commentId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, _variables) => {
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['comments', module, relatedId] 
      });
      toast.success('Comment updated successfully');
    },
   
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(getApiErrorMessage(error, 'Error updating comment'));
    },
  });
};