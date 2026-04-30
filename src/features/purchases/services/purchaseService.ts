import apiClient from '@/shared/lib/axios';
import type { Purchase, PurchaseFormData } from '../types/purchase';

const PURCHASES_API = '/purchases';

export const purchaseService = {
  async getPurchases(page: number, limit: number, searchTerm: string, filters?: {
    status?: string;
    projectId?: number;
  }) {
    const params: Record<string, any> = { page, limit };
     if (searchTerm) params.search = searchTerm;
    if (filters?.status) params.status = filters.status;
    if (filters?.projectId) params.project_id = filters.projectId;
    
    const response = await apiClient.get(PURCHASES_API, { params });
    return response.data;
  },

  async getPurchase(id: number) {
    const response = await apiClient.get(`${PURCHASES_API}/${id}`);
    return response.data as Purchase;
  },

  async createPurchase(data: PurchaseFormData) {
    const response = await apiClient.post(PURCHASES_API, data);
    return response.data;
  },

  async updatePurchase(id: number, data: PurchaseFormData) {
    const response = await apiClient.put(`${PURCHASES_API}/${id}`, data);
    return response.data;
  },

  async deletePurchase(id: number) {
    await apiClient.delete(`${PURCHASES_API}/${id}`);
  },
};