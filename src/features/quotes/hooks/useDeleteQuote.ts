import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteService } from '../services/quoteService';

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Cotización eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar la cotización');
    },
  });
};