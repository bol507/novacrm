// src/features/purchases/hooks/usePurchaseDetail.ts

import { useQuery } from '@tanstack/react-query';
import { purchaseService } from '../services/purchaseService';

/**
 * Hook for fetching a single purchase order by ID.
 *
 * Provides automatic caching and state management for purchase detail data.
 * The query is only enabled when a valid purchaseId is provided.
 *
 * @param purchaseId - The ID of the purchase to fetch (as string, will be parsed to number)
 * @returns Query result containing purchase data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data: purchase, isLoading, error } = usePurchaseDetail('123');
 *
 * @example
 * // With conditional rendering
 * const { data: purchase, isLoading } = usePurchaseDetail(purchaseId);
 *
 * if (isLoading) return <Spinner />;
 * if (!purchase) return <NotFound />;
 *
 * return <PurchaseDetail purchase={purchase} />;
 */
export const usePurchaseDetail = (purchaseId: string) => {
  return useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: () => purchaseService.getPurchase(parseInt(purchaseId)),
    enabled: !!purchaseId && purchaseId !== 'undefined',
    staleTime: 0,
    retry: 1,
  });
};