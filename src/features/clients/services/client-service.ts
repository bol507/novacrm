import apiClient from '@/shared/lib/axios';
import type { Client, PaginatedResponse } from '@/features/clients/types/client';

export const clientService = {
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

  async getClientById(id: number): Promise<Client> {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

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

  async updateClient(id: number, clientData: any): Promise<void> {
    const payload = {
      ...clientData,
      emailoptout: clientData.emailoptout ? '1' : '0',
      notify_owner: clientData.notify_owner ? '1' : '0',
      isconvertedfromlead: clientData.isconvertedfromlead ? '1' : '0',
    };
    await apiClient.put(`/clients/${id}`, payload);
  },

  async deleteClient(id: number): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }
};