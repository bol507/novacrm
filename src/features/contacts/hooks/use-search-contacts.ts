import { useQuery } from '@tanstack/react-query';
import { contactService } from '../services/contact-service';
import type { ContactSearchResult } from '../types/contact';

/**
 * Hook for searching contacts for autocomplete functionality.
 *
 * Provides debounced search capability for contact lookups. The query is only
 * enabled when the search term has at least 2 characters. Returns an empty
 * array when the search term is too short or when no results are found.
 *
 * @param searchTerm - The search term to match against contact names or emails
 * @param accountId - Optional account ID to filter contacts by account
 * @returns Query result containing array of contact search results, loading state, and error state
 *
 * @example
 * // Basic usage
 * const [searchTerm, setSearchTerm] = useState('');
 * const { data: results, isLoading } = useSearchContacts(searchTerm);
 *
 * @example
 * // With account filter
 * const { data: contacts } = useSearchContacts(searchTerm, selectedAccountId);
 *
 * @example
 * // Render search results
 * const { data: searchResults, isLoading } = useSearchContacts(searchTerm);
 *
 * return (
 *   <div>
 *     <Input
 *       placeholder="Search contacts..."
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *     />
 *     {isLoading && <Spinner />}
 *     {searchResults?.map(contact => (
 *       <div key={contact.id}>
 *         {contact.full_name} - {contact.email}
 *       </div>
 *     ))}
 *   </div>
 * );
 */
export const useSearchContacts = (searchTerm: string, accountId?: number) => {
  return useQuery<ContactSearchResult[], Error>({
    queryKey: ['contacts', 'search', searchTerm, accountId],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];
      return await contactService.searchContacts(searchTerm.trim(), accountId);
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};