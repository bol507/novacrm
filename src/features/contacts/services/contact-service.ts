import apiClient from '@/shared/lib/axios';
import type { Contact, ContactFormData, ContactFilters, ContactResponse, ContactSearchResult } from '../types/contact';

export const contactService = {
  /**
   * Retrieves a list of contacts with optional filters and pagination.
   *
   * @param filters - Filter and pagination options
   * @param filters.page - Page number (1-indexed)
   * @param filters.limit - Number of items per page
   * @param filters.search - Optional search term to filter by name or email
   * @param filters.accountId - Optional filter by associated account ID
   * @param filters.assignedTo - Optional filter by assigned user ID
   * @param filters.status - Optional filter by contact status ('Active' or 'Inactive')
   * @param filters.sortBy - Optional field to sort by
   * @param filters.sortOrder - Optional sort direction ('ASC' or 'DESC')
   * @returns Promise resolving to paginated contact list response
   *
   * @example
   * // Basic pagination
   * const contacts = await contactService.getContacts({ page: 1, limit: 20 });
   *
   * @example
   * // With filters
   * const contacts = await contactService.getContacts({
   *   page: 1,
   *   limit: 20,
   *   search: 'John',
   *   accountId: 123,
   *   status: 'Active'
   * });
   */
  getContacts: async (filters: ContactFilters): Promise<ContactResponse> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.accountId && { account_id: filters.accountId.toString() }),
      ...(filters.assignedTo && { assigned_to: filters.assignedTo.toString() }),
      ...(filters.status && { status: filters.status }),
      ...(filters.sortBy && { sort_by: filters.sortBy }),
      ...(filters.sortOrder && { sort_order: filters.sortOrder }),
    });
    const response = await apiClient.get<ContactResponse>('/contacts', { params });
    return response.data;
  },

  /**
   * Retrieves a single contact by its ID.
   *
   * @param id - The ID of the contact to retrieve
   * @returns Promise resolving to the contact data
   *
   * @example
   * const contact = await contactService.getContactById(123);
   */
  getContactById: async (id: number): Promise<Contact> => {
    const response = await apiClient.get<{ data: Contact }>(`/contacts/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new contact.
   *
   * @param data - The contact form data
   * @returns Promise resolving to the ID of the created contact
   *
   * @example
   * const contactId = await contactService.createContact({
   *   firstname: 'John',
   *   lastname: 'Doe',
   *   email: 'john.doe@example.com',
   *   accountid: 123
   * });
   */
  createContact: async (data: ContactFormData): Promise<number> => {
    const response = await apiClient.post<{ data: { contactid: number } }>('/contacts', data);
    return response.data.data.contactid;
  },

  /**
   * Updates an existing contact.
   *
   * @param id - The ID of the contact to update
   * @param data - The updated contact data
   * @returns Promise that resolves when update is complete
   *
   * @example
   * await contactService.updateContact(123, {
   *   firstname: 'Jane',
   *   phone: '555-1234'
   * });
   */
  updateContact: async (id: number, data: ContactFormData): Promise<void> => {
    await apiClient.put(`/contacts/${id}`, data);
  },

  /**
   * Deletes a contact (soft delete).
   *
   * @param id - The ID of the contact to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * await contactService.deleteContact(123);
   */
  deleteContact: async (id: number): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },

  /**
   * Searches for contacts for autocomplete functionality.
   *
   * @param searchTerm - Search term to match against name or email
   * @param accountId - Optional account ID to filter contacts by account
   * @returns Promise resolving to an array of contact search results
   *
   * @example
   * // Search all contacts
   * const results = await contactService.searchContacts('John');
   *
   * @example
   * // Search contacts within a specific account
   * const results = await contactService.searchContacts('John', 123);
   */
  searchContacts: async (searchTerm: string, accountId?: number): Promise<ContactSearchResult[]> => {
    const params = new URLSearchParams({ q: searchTerm });
    if (accountId) params.append('account_id', accountId.toString());
    
    const response = await apiClient.get<{ data: ContactSearchResult[] }>('/contacts/search', { params });
    return response.data.data;
  },

  /**
   * Retrieves all contacts associated with a specific account.
   *
   * @param accountId - The ID of the account
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 20)
   * @returns Promise resolving to paginated contact list for the account
   *
   * @example
   * const contacts = await contactService.getContactsByAccount(123);
   */
  getContactsByAccount: async (
    accountId: number,
    page = 1,
    limit = 20
  ): Promise<ContactResponse> => {
    return contactService.getContacts({
      page,
      limit,
      accountId,
      sortBy: 'lastname',
      sortOrder: 'ASC',
    });
  },
};