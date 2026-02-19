import { useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';
import { toast } from 'sonner';

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      opportunityService.updateOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success("Oportunidad actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Error al actualizar la oportunidad"
      );
    },
  });
};