import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import apiClient from '@/shared/lib/axios';
import type { ApiErrorResponse } from '@/shared/types/api-error';

export interface DuplicateQuoteResponse {
  success: boolean;
  message: string;
  data: {
    quoteId: number;
    redirectUrl: string;
  };
}

export interface DuplicateQuoteVariables {
  quoteId: number;
  suffix?: string;  
}

/**
 * Hook for duplicating an existing quote.
 * 
 * @returns Mutation object with duplicateQuote function and state
 * 
 * @example
 * const { duplicateQuote, isPending, isError } = useDuplicateQuote();
 * 
 * const handleDuplicate = async () => {
 *   try {
 *     const newQuoteId = await duplicateQuote({ quoteId: 123 });
 *     navigate(`/dashboard/quotes/${newQuoteId}`);
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 */
export const useDuplicateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation<number, AxiosError<ApiErrorResponse>, DuplicateQuoteVariables>({
    mutationFn: async ({ quoteId, suffix }) => {
      const response = await apiClient.post<DuplicateQuoteResponse>(
        `/quotes/${quoteId}/duplicate`,
        { suffix }  
      );
      return response.data.data.quoteId;
    },

    onSuccess: (_newQuoteId, variables) => {      
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
    },

    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Error duplicating quote';
      toast.error(errorMessage);
    },
  });
};