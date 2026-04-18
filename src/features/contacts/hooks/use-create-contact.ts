import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contactService } from '../services/contact-service';
import type { ContactFormData } from '../types/contact';

/**
 * Hook for creating a new contact.
 *
 * Provides mutation functionality to create a contact with the given data.
 * On success, invalidates the contacts query to trigger a refetch and
 * displays a success toast notification. On error, displays an error toast.
 *
 * @returns Mutation object containing mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const createContact = useCreateContact();
 *
 * const handleCreate = async (formData: ContactFormData) => {
 *   const contactId = await createContact.mutateAsync(formData);
 *   navigate(`/contacts/${contactId}`);
 * };
 *
 * @example
 * // With loading state
 * const createContact = useCreateContact();
 *
 * <Button
 *   onClick={() => createContact.mutate(formData)}
 *   disabled={createContact.isPending}
 * >
 *   {createContact.isPending ? 'Creating...' : 'Create Contact'}
 * </Button>
 */
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation<number, Error, ContactFormData>({
    mutationFn: async (data: ContactFormData) => {
      return await contactService.createContact(data);
    },
    onSuccess: (contactId: number) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact created successfully');
      return contactId;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error creating contact');
    },
  });
};