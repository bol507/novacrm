import { clientService } from '@/features/clients/services/client-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};