import { useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';
import { toast } from 'sonner';

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityData: any) => 
      opportunityService.createOpportunity(opportunityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success("Oportunidad creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Error al crear la oportunidad"
      );
    },
  });
};