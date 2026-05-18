import apiClient from '@/shared/lib/axios';
import type { Quote, QuoteFormData, QuoteSortConfig } from '../types/quote';

const QUOTES_API = '/quotes';

export const quoteService = {
  /**
   * Retrieves a paginated list of quotes.
   *
   * @param page - Page number to fetch
   * @param perPage - Number of items per page
   * @param search - Optional search term to filter quotes by subject or number
   * @param filters - Optional filters for the query
   * @param filters.clientId - Optional client ID to filter quotes by client
   * @returns Promise resolving to paginated quote list response
   *
   * @example
   * // Basic pagination
   * const quotes = await quoteService.getQuotes(1, 20);
   *
   * @example
   * // With search and client filter
   * const quotes = await quoteService.getQuotes(1, 20, 'project', { clientId: 123 });
   */
  async getQuotes(
    page: number,
    perPage: number,
    search?: string,
    filters?: { clientId?: number },
    sortConfig?: QuoteSortConfig
  ) {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
    };

    if (search) params.search = search;
    if (filters?.clientId) params.account_id = filters.clientId;

    if (sortConfig?.field) {
      params.sort_by = sortConfig.field;
      params.sort_dir = sortConfig.direction || 'desc';
    }

    const response = await apiClient.get(QUOTES_API, { params });
    return response.data;
  },

  /**
   * Retrieves a single quote by its ID.
   *
   * @param id - The ID of the quote to retrieve
   * @returns Promise resolving to the quote data
   *
   * @example
   * const quote = await quoteService.getQuote(123);
   */
  async getQuote(id: number) {
    const response = await apiClient.get(`${QUOTES_API}/${id}`);
    return response.data as Quote;
  },

  /**
   * Creates a new quote.
   *
   * @param data - The quote form data
   * @returns Promise resolving to the created quote response
   *
   * @example
   * const newQuote = await quoteService.createQuote({
   *   subject: 'New Quote',
   *   account_id: 123,
   *   items: [...]
   * });
   */
  async createQuote(data: QuoteFormData) {
    const response = await apiClient.post(QUOTES_API, data);
    return response.data;
  },

  /**
   * Updates an existing quote.
   *
   * @param id - The ID of the quote to update
   * @param data - The updated quote form data
   * @returns Promise resolving to the updated quote response
   *
   * @example
   * const updated = await quoteService.updateQuote(123, {
   *   subject: 'Updated Quote Subject'
   * });
   */
  async updateQuote(id: number, data: QuoteFormData) {
    const response = await apiClient.put(`${QUOTES_API}/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a quote by its ID.
   *
   * @param id - The ID of the quote to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * await quoteService.deleteQuote(123);
   */
  async deleteQuote(id: number) {
    await apiClient.delete(`${QUOTES_API}/${id}`);
  },

  /**
   * Downloads a quote as a PDF file.
   *
   * @param quoteId - The ID of the quote to download
   * @returns Promise resolving to a Blob containing the PDF data
   *
   * @example
   * const blob = await quoteService.downloadPDF(123);
   * const url = URL.createObjectURL(blob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = 'quote.pdf';
   * link.click();
   */
  async downloadPDF(quoteId: number) {
    const response = await apiClient.get(`/quotes/${quoteId}/pdf/download`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  /**
   * Previews a quote as a PDF in a new browser tab.
   *
   * @param quoteId - The ID of the quote to preview
   * @returns Promise resolving to the PDF blob after opening in new tab
   *
   * @example
   * await quoteService.previewPDF(123);
   * // Opens the PDF in a new browser tab
   */
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