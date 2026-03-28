import { useQuery } from '@tanstack/react-query';
import type { Opportunity } from '@/features/opportunity/types/opportunity';
import { opportunityService } from '@/features/opportunity/services/opportunityService';

export const useOpportunity = (id: number | null | undefined) => {
  return useQuery<Opportunity, Error>({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      if (!id || id <= 0) {
        throw new Error('Invalid opportunity ID');
      }
      return await opportunityService.getOpportunity(id);
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
