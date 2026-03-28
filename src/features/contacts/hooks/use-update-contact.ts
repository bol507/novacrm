import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contactService } from '../services/contact-service';
import type { ContactFormData } from '../types/contact';

interface UpdateContactParams {
  /** ID of the contact to update */
  id: number;
  /** Updated contact form data */
  data: ContactFormData;
}

/**
 * Hook for updating an existing contact.
 *
 * Provides mutation functionality to update a contact with the given data.
 * On success, invalidates the specific contact query and the contacts list query
 * to trigger refetching, and displays a success toast notification.
 * On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const updateContact = useUpdateContact();
 *
 * const handleUpdate = async (contactId: number, formData: ContactFormData) => {
 *   await updateContact.mutateAsync({ id: contactId, data: formData });
 * };
 *
 * @example
 * // With loading state
 * const updateContact = useUpdateContact();
 *
 * <Button
 *   onClick={() => updateContact.mutate({ id: 123, data: formData })}
 *   disabled={updateContact.isPending}
 * >
 *   {updateContact.isPending ? 'Saving...' : 'Save Changes'}
 * </Button>
 *
 * @example
 * // With optimistic updates (optional)
 * const updateContact = useUpdateContact();
 *
 * const handleUpdate = async (formData: ContactFormData) => {
 *   await updateContact.mutateAsync(
 *     { id: contact.id, data: formData },
 *     {
 *       onSuccess: () => {
 *         // Additional success handling
 *         navigate(`/contacts/${contact.id}`);
 *       }
 *     }
 *   );
 * };
 */
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UpdateContactParams>({
    mutationFn: async ({ id, data }: UpdateContactParams) => {
      return await contactService.updateContact(id, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error updating contact');
    },
  });
};