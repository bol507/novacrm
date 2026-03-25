

import apiClient from '@/shared/lib/axios';
import type { Quote, QuoteFormData } from '../types/quote';

const QUOTES_API = '/quotes';

export const quoteService = {
  async getQuotes(
  page: number, 
  perPage: number, 
  search?: string, 
  filters?:{ clientId?: number }
) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
  };
  
  if (search) params.search = search;
  if (filters?.clientId) params.account_id = filters.clientId;  
  
  const response = await apiClient.get(QUOTES_API, { params });  
  return response.data;
},

  async getQuote(id: number) {
    const response = await apiClient.get(`${QUOTES_API}/${id}`);
    return response.data as Quote;
  },

  async createQuote(data: QuoteFormData) {
    const response = await apiClient.post(QUOTES_API, data);
    return response.data;
  },

  async updateQuote(id: number, data: QuoteFormData) {
    const response = await apiClient.put(`${QUOTES_API}/${id}`, data);
    return response.data;
  },

  async deleteQuote(id: number) {
    await apiClient.delete(`${QUOTES_API}/${id}`);
  },

  async downloadPDF(quoteId: number) {
    const response = await apiClient.get(`/quotes/${quoteId}/pdf/download`, {
      responseType: 'blob' 
    });

    
   /* const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cotizacion_${quoteId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
*/
    return response.data as Blob;
  },

  async previewPDF(quoteId: number) {
    const response = await apiClient.get(`/quotes/${quoteId}/pdf/preview`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');

    return response.data;
  }
};