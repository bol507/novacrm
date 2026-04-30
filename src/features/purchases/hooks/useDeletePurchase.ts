// src/features/purchases/hooks/useDeletePurchase.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseService } from '../services/purchaseService';

/**
 * Hook for deleting a purchase order.
 *
 * Provides mutation functionality to delete a purchase order by ID.
 * On success, invalidates purchases and project-purchases queries to trigger refetching
 * and displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const deletePurchase = useDeletePurchase();
 *
 * const handleDelete = async (purchaseId: number) => {
 *   await deletePurchase.mutateAsync(purchaseId);
 * };
 */
export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await purchaseService.deletePurchase(id);
    },
    onSuccess: (_data, _deletedId) => {
      // Invalidate purchases list
      queryClient.invalidateQueries({
        queryKey: ['purchases']
      });

      // Invalidate project purchases
      queryClient.invalidateQueries({
        queryKey: ['project-purchases']
      });

      toast.success('Purchase order deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error deleting purchase order';
      toast.error(errorMessage);
    },
  });
};