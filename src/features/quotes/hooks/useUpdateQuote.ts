import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteService } from '../services/quoteService';
import type { QuoteFormData } from '../types/quote';

interface UpdateQuoteParams {
  id: number;
  data: QuoteFormData;
}

/**
 * Hook for updating an existing quote.
 *
 * Provides mutation functionality to update a quote with the given data.
 * On success, invalidates quote and quotes queries to trigger refetching
 * and displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const updateQuote = useUpdateQuote();
 *
 * const handleUpdate = async (quoteId: number, formData: QuoteFormData) => {
 *   await updateQuote.mutateAsync({ id: quoteId, data: formData });
 * };
 *
 * @example
 * // With loading state
 * const updateQuote = useUpdateQuote();
 *
 * <Button
 *   onClick={() => updateQuote.mutate({ id: 123, data })}
 *   disabled={updateQuote.isPending}
 * >
 *   {updateQuote.isPending ? 'Saving...' : 'Save Changes'}
 * </Button>
 */
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: UpdateQuoteParams) => {
      return await quoteService.updateQuote(id, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['quote', variables.id.toString()] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['quotes'] 
      });
      toast.success('Quote updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error updating quote');
    },
  });
};
