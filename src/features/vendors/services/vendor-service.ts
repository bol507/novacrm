import apiClient from '@/shared/lib/axios';
import type { VendorSearchResult } from '../hooks/use-search-vendors';
import type { Vendor, VendorFormValues } from '../types/vendor';

const VENDORS_API = '/vendors';

export const vendorService = {
    /**
    * Get all vendors with pagination.
    */
    async getVendors(
        page: number, 
        limit: number, 
         filters?: { search?: string; category?: string }
    ) {
        const params: any = { page, limit };
        if (filters?.search) params.search = filters.search;
        if (filters?.category) params.category = filters.category;
        const response = await apiClient.get(VENDORS_API, { params });
        return response.data;
    },

    

    /**
    * Get a single vendor by ID.
    */
    async getVendor(id: number): Promise<Vendor> {
        const response = await apiClient.get(`${VENDORS_API}/${id}`);
        return response.data;
    },

    /**
     * Search vendors by name or email.
     *
     * @param searchTerm - Search term to filter vendors
     * @returns Promise resolving to array of vendor search results
     */
    async searchVendors(searchTerm: string): Promise<VendorSearchResult[]> {
        if (!searchTerm || searchTerm.length < 2) {
        return [];
        }

        const response = await apiClient.get(`${VENDORS_API}/search`, {
        params: { search: searchTerm },
        });
        return response.data?.data || response.data || [];
    },

    async createVendor(data: VendorFormValues) {
        const response = await apiClient.post(VENDORS_API, data);
        return response.data;
    },

    
    async updateVendor(id: number, data: VendorFormValues) {
      const response = await apiClient.put(`${VENDORS_API}/${id}`, data);
      return response.data;
    },

    async deleteVendor(id: number) {
      await apiClient.delete(`${VENDORS_API}/${id}`);
    },

    
};