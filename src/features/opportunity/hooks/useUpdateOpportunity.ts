import { useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => 
      opportunityService.updateOpportunity(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['opportunity', variables.id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
        exact: false,
      });
    },
    onError: (error: any) => {
       console.error('Error updating opportunity:', error);
    },
  });
};