import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteService } from '../services/quoteService';
import type { QuoteFormData } from '../types/quote';

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: QuoteFormData) => quoteService.createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Cotización creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear la cotización');
    },
  });
};