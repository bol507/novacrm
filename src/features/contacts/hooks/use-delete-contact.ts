import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contactService } from '../services/contact-service';

/**
 * Hook for deleting a contact.
 *
 * Provides mutation functionality to delete a contact by ID.
 * On success, invalidates the contacts list query to trigger a refetch
 * and displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const deleteContact = useDeleteContact();
 *
 * const handleDelete = async (contactId: number) => {
 *   await deleteContact.mutateAsync(contactId);
 * };
 *
 * @example
 * // With confirmation dialog
 * const deleteContact = useDeleteContact();
 *
 * const handleDelete = (contactId: number) => {
 *   if (confirm('Are you sure you want to delete this contact?')) {
 *     deleteContact.mutate(contactId);
 *   }
 * };
 *
 * @example
 * // With loading state
 * const deleteContact = useDeleteContact();
 *
 * <Button
 *   onClick={() => deleteContact.mutate(contact.id)}
 *   disabled={deleteContact.isPending}
 *   variant="destructive"
 * >
 *   {deleteContact.isPending ? 'Deleting...' : 'Delete Contact'}
 * </Button>
 */
export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      return await contactService.deleteContact(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error deleting contact');
    },
  });
};