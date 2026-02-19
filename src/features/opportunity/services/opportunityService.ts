import apiClient from "@/shared/lib/axios";


export const opportunityService = {
  async getOpportunities(page: number = 1, perPage: number = 20, search?: string) {
    const params: Record<string, any> = { page, per_page: perPage };
    if (search) params.search = search;
    
    const response = await apiClient.get('/opportunities', { params });
    return response.data;
  },

  async createOpportunity(opportunityData: any) {
    const response = await apiClient.post('/opportunities', opportunityData);
    return response.data;
  },

  async updateOpportunity(id: number, opportunityData: any) {
    const response = await apiClient.put(`/opportunities/${id}`, opportunityData);
    return response.data;
  },

  async deleteOpportunity(id: number) {
    await apiClient.delete(`/opportunities/${id}`);
  }
};