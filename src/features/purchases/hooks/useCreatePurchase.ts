import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseService } from '../services/purchaseService';
import type { PurchaseFormData } from '../types/purchase';

/**
 * Hook for creating a new purchase order.
 *
 * Provides mutation functionality to create a purchase order with the given data.
 * On success, invalidates purchases and project-purchases queries to trigger refetching
 * and displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const createPurchase = useCreatePurchase();
 *
 * const handleCreate = async (formData: PurchaseFormData) => {
 *   await createPurchase.mutateAsync(formData);
 * };
 *
 * @example
 * // With loading state
 * const createPurchase = useCreatePurchase();
 *
 * <Button
 *   onClick={() => createPurchase.mutate(formData)}
 *   disabled={createPurchase.isPending}
 * >
 *   {createPurchase.isPending ? 'Creating...' : 'Create Purchase'}
 * </Button>
 */
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PurchaseFormData) => {
      return await purchaseService.createPurchase(data);
    },
    onSuccess: (response) => {
      // Invalidate purchases list
      queryClient.invalidateQueries({
        queryKey: ['purchases']
      });

      // Invalidate project purchases if projectId exists
      if (response.data?.projectid) {
        queryClient.invalidateQueries({
          queryKey: ['project-purchases', response.data.projectid]
        });

        // Also invalidate the project detail to update budget tracking
        queryClient.invalidateQueries({
          queryKey: ['project', response.data.projectid.toString()]
        });
      }

      toast.success('Purchase order created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error creating purchase order';
      toast.error(errorMessage);
    },
  });
};