import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseService } from '../services/purchaseService';
import type { PurchaseFormData } from '../types/purchase';

/**
 * Interface for update purchase mutation parameters
 */
interface UpdatePurchaseParams {
  /** Purchase order ID to update */
  id: number;
  /** Updated purchase form data */
  data: PurchaseFormData;
}

/**
 * Hook for updating an existing purchase order.
 *
 * Provides mutation functionality to update a purchase order with the given data.
 * On success, invalidates purchase, purchases, and project-purchases queries to trigger refetching
 * and displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const updatePurchase = useUpdatePurchase();
 *
 * const handleUpdate = async (purchaseId: number, formData: PurchaseFormData) => {
 *   await updatePurchase.mutateAsync({ id: purchaseId, data: formData });
 * };
 *
 * @example
 * // With loading state
 * const updatePurchase = useUpdatePurchase();
 *
 * <Button
 *   onClick={() => updatePurchase.mutate({ id: 123, data })}
 *   disabled={updatePurchase.isPending}
 * >
 *   {updatePurchase.isPending ? 'Saving...' : 'Save Changes'}
 * </Button>
 */
export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdatePurchaseParams) => {
      return await purchaseService.updatePurchase(id, data);
    },
    onSuccess: (_data, variables) => {
      // Invalidate single purchase detail
      queryClient.invalidateQueries({
        queryKey: ['purchase', variables.id.toString()]
      });

      // Invalidate purchases list
      queryClient.invalidateQueries({
        queryKey: ['purchases']
      });

      // Invalidate project purchases (projectId will be in the response, but we can't access it here)
      // This will be refetched when the user navigates to the project
      queryClient.invalidateQueries({
        queryKey: ['project-purchases']
      });

      toast.success('Purchase order updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error updating purchase order';
      toast.error(errorMessage);
    },
  });
};