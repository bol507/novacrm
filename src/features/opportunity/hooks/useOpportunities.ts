import { useQuery } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';

export interface OpportunityFilters {
  clientId?: number;
  stage?: string;
  salesStage?: string;
}

export const useOpportunities = (page: number = 1, perPage: number = 20, search?: string, filters?: OpportunityFilters) => {
  
  return useQuery({
    queryKey: ['opportunities', page, perPage, search, filters],
    queryFn: () => opportunityService.getOpportunities(page, perPage, search, filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};