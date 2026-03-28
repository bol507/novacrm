import { useQuery } from '@tanstack/react-query';
import { contactService } from '../services/contact-service';
import type { Contact } from '../types/contact';

/**
 * Hook for fetching a single contact by ID.
 *
 * Provides automatic caching and state management for contact detail data.
 * The query is only enabled when a valid contactId is provided.
 *
 * @param contactId - The ID of the contact to fetch (can be string, number, or undefined)
 * @returns Query result containing contact data, loading state, and error state
 *
 * @example
 * // Basic usage
 * const { data: contact, isLoading, error } = useContactDetail(123);
 *
 * @example
 * // With string ID from URL params
 * const { contactId } = useParams();
 * const { data: contact } = useContactDetail(contactId);
 *
 * @example
 * // Conditional fetching
 * const { data: contact } = useContactDetail(selectedContactId);
 * if (!contact) return <Loading />;
 *
 * @example
 * // With error handling
 * const { data, error, refetch } = useContactDetail(contactId);
 *
 * if (error) {
 *   return (
 *     <div>
 *       <p>Failed to load contact: {error.message}</p>
 *       <Button onClick={() => refetch()}>Retry</Button>
 *     </div>
 *   );
 * }
 */
export const useContactDetail = (contactId: string | number | undefined) => {
  return useQuery<Contact, Error>({
    queryKey: ['contact', contactId?.toString()],
    queryFn: () => contactService.getContactById(Number(contactId)),
    enabled: !!contactId && !isNaN(Number(contactId)),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};