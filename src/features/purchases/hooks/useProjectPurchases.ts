import { useQuery } from '@tanstack/react-query';
import { purchaseService } from '../services/purchaseService';

export const useProjectPurchases = (projectId: number | null) => {
  return useQuery({
    queryKey: ['project-purchases', projectId],
    queryFn: () => purchaseService.getPurchases(1, 100,'', { projectId: projectId! }),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};