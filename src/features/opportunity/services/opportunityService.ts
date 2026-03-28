import apiClient from "@/shared/lib/axios";

/**
 * Service for managing opportunities (sales opportunities).
 * Handles all API interactions for opportunity CRUD operations.
 */
export const opportunityService = {
  /**
   * Retrieves a paginated list of opportunities.
   *
   * @param page - Page number to fetch (default: 1)
   * @param perPage - Number of items per page (default: 20)
   * @param search - Optional search term to filter opportunities by name
   * @param filters - Optional filters for the query
   * @param filters.clientId - Optional client ID to filter opportunities by client
   * @returns Promise resolving to paginated opportunity list response
   *
   * @example
   * // Basic pagination
   * const opportunities = await opportunityService.getOpportunities(1, 20);
   *
   * @example
   * // With search and client filter
   * const opportunities = await opportunityService.getOpportunities(1, 20, 'project', { clientId: 123 });
   */
  async getOpportunities(
    page: number = 1, 
    perPage: number = 20, 
    search?: string, 
    filters?: { clientId?: number }
  ) {
    const params: Record<string, any> = { page, per_page: perPage };
    if (search) params.search = search;
    if (filters?.clientId) params.account_id = filters.clientId;
    
    const response = await apiClient.get('/opportunities', { params });
    return response.data;
  },

  /**
   * Creates a new opportunity.
   *
   * @param opportunityData - The opportunity data to create
   * @returns Promise resolving to the created opportunity response
   *
   * @example
   * const newOpportunity = await opportunityService.createOpportunity({
   *   potentialname: 'New Project',
   *   amount: 50000,
   *   related_to: 123,
   *   assigned_user_id: 1
   * });
   */
  async createOpportunity(opportunityData: any) {
    const response = await apiClient.post('/opportunities', opportunityData);
    return response.data;
  },

  /**
   * Updates an existing opportunity.
   *
   * @param id - The ID of the opportunity to update
   * @param opportunityData - The updated opportunity data
   * @returns Promise resolving to the updated opportunity response
   *
   * @example
   * const updated = await opportunityService.updateOpportunity(123, {
   *   potentialname: 'Updated Project Name',
   *   amount: 75000
   * });
   */
  async updateOpportunity(id: number, opportunityData: any) {
    const response = await apiClient.put(`/opportunities/${id}`, opportunityData);
    return response.data;
  },

  /**
   * Deletes an opportunity by its ID.
   *
   * @param id - The ID of the opportunity to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * await opportunityService.deleteOpportunity(123);
   */
  async deleteOpportunity(id: number) {
    await apiClient.delete(`/opportunities/${id}`);
  },

  /**
   * Retrieves a single opportunity by its ID.
   *
   * @param id - The ID of the opportunity to retrieve
   * @returns Promise resolving to the opportunity data
   *
   * @example
   * const opportunity = await opportunityService.getOpportunity(123);
   */
  async getOpportunity(id: number) {
    const response = await apiClient.get(`/opportunities/${id}`);
    return response.data;
  }
};