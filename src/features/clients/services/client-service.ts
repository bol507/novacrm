import apiClient from '@/shared/lib/axios';
import type { Client, ClientSummary, PaginatedResponse } from '@/features/clients/types/client';

export const clientService = {
  /**
   * Retrieves a paginated list of clients.
   *
   * @param page - Page number to fetch (default: 1)
   * @param perPage - Number of items per page (default: 20)
   * @param search - Optional search term to filter clients by name, email, or phone
   * @returns Promise resolving to paginated client list response
   *
   * @example
   * // Basic pagination
   * const clients = await clientService.getClients(1, 20);
   *
   * @example
   * // With search
   * const clients = await clientService.getClients(1, 20, 'acme');
   */
  async getClients(
    page: number = 1,
    perPage: number = 20,
    search?: string,
  ): Promise<PaginatedResponse<Client>> {
    const params: Record<string, any> = { page, per_page: perPage };
    if (search) params.search = search;
    const response = await apiClient.get('/clients', { params });
    return response.data;
  },

  /**
   * Retrieves a single client by its ID.
   *
   * @param id - The ID of the client to retrieve
   * @returns Promise resolving to the client data
   *
   * @example
   * const client = await clientService.getClientById(123);
   */
  async getClientById(id: number): Promise<Client> {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Creates a new client.
   *
   * @param clientData - The client data to create
   * @returns Promise resolving to the created client ID
   *
   * @example
   * const { client_id } = await clientService.createClient({
   *   accountname: 'Acme Corp',
   *   email1: 'contact@acme.com',
   *   phone: '123-456-7890'
   * });
   */
  async createClient(clientData: any): Promise<{ client_id: number }> {
    const payload = {
      ...clientData,
      emailoptout: clientData.emailoptout ? '1' : '0',
      notify_owner: clientData.notify_owner ? '1' : '0',
      isconvertedfromlead: clientData.isconvertedfromlead ? '1' : '0',
    };
    const response = await apiClient.post('/clients', payload);
    return response.data;
  },

  /**
   * Updates an existing client.
   *
   * @param id - The ID of the client to update
   * @param clientData - The updated client data
   * @returns Promise that resolves when update is complete
   *
   * @example
   * await clientService.updateClient(123, {
   *   accountname: 'Updated Corp Name'
   * });
   */
  async updateClient(id: number, clientData: any): Promise<void> {
    const payload = {
      ...clientData,
      emailoptout: clientData.emailoptout ? '1' : '0',
      notify_owner: clientData.notify_owner ? '1' : '0',
      isconvertedfromlead: clientData.isconvertedfromlead ? '1' : '0',
    };
    await apiClient.put(`/clients/${id}`, payload);
  },

  /**
   * Deletes a client by its ID.
   *
   * @param id - The ID of the client to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * await clientService.deleteClient(123);
   */
  async deleteClient(id: number): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  },

  /**
   * Searches for clients by search term.
   *
   * @param searchTerm - The search term to match against client names, emails, or phones
   * @returns Promise resolving to an array of matching clients
   *
   * @example
   * const results = await clientService.searchClients('acme');
   */
  async searchClients(searchTerm: string) {
    const response = await apiClient.get('/clients/search', {
      params: { q: searchTerm }
    });
    return response.data.data;
  },

  /**
   * Finds a client by exact account name.
   *
   * @param accountName - The exact account name to search for
   * @returns Promise resolving to the matching client
   *
   * @example
   * const client = await clientService.findClientByAccountName('Acme Corp');
   */
  async findClientByAccountName(accountName: string) {
    const response = await apiClient.get('/clients/find-by-name', {
      params: { accountname: accountName }
    });
    return response.data.data;
  },

  /**
   * Retrieves a summary of related entities for a client.
   *
   * @param clientId - The ID of the client
   * @returns Promise resolving to client summary with counts of opportunities, quotes, projects, and contacts
   *
   * @example
   * const summary = await clientService.getClientSummary(123);
   */
  async getClientSummary(clientId: number): Promise<ClientSummary> {
    const response = await apiClient.get(`/clients/${clientId}/summary`);
    return response.data;
  },
};