

import apiClient from '@/shared/lib/axios';
import type { Quote, QuoteFormData } from '../types/quote';

const QUOTES_API = '/quotes';

export const quoteService = {
  async getQuotes(page: number, perPage: number, search?: string) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    if (search) params.append('search', search);

    const response = await apiClient.get(`${QUOTES_API}?${params.toString()}`);
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
      responseType: 'blob' // Importante para PDF
    });

    // Crear y descargar el archivo
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cotizacion_${quoteId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    return response.data;
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