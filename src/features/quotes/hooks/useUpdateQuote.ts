import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteService } from '../services/quoteService';
import type { QuoteFormData } from '../types/quote';

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuoteFormData }) => 
      quoteService.updateQuote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Cotización actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar la cotización');
    },
  });
};