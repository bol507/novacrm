import { useQuery } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';

export const useOpportunities = (page: number = 1, perPage: number = 20, search?: string) => {
  return useQuery({
    queryKey: ['opportunities', page, perPage, search],
    queryFn: () => opportunityService.getOpportunities(page, perPage, search),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};