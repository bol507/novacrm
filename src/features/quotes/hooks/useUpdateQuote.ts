import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteService } from '../services/quoteService';
import type { QuoteFormData } from '../types/quote';

interface UpdateQuoteParams {
  id: number;
  data: QuoteFormData;
}

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
      toast.success('Cotización actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar la cotización');
    },
  });
};