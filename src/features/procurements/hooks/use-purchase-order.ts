import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '../services/procurement-service';
import type { GeneratePOFromQuotePayload } from '../types/procurement';

export const usePurchaseOrders = {
  list: (projectId: number, params?: { status?: string; vendor_id?: number }) => {
    return useQuery({
      queryKey: ['procurement', 'purchase-orders', projectId, params],
      queryFn: () => procurementService.listPOs(projectId, params).then(res => res.data),
      enabled: !!projectId,
      staleTime: 1 * 60 * 1000,
    });
  },

  get: (projectId: number, poId: number) => {
    return useQuery({
      queryKey: ['procurement', 'purchase-order', poId],
      queryFn: () => procurementService.getPO(projectId, poId).then(res => res.data),
      enabled: !!projectId && !!poId,
      staleTime: 30 * 1000,
    });
  },

  createFromQuote: (projectId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: GeneratePOFromQuotePayload) => 
        procurementService.createPOFromQuote(projectId, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', projectId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quote'] });
      },
    });
  },

  updateStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ poId, status }: { poId: number; status: string }) =>
        procurementService.updatePOStatus(poId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders'] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-order'] });
      },
    });
  },
};