import apiClient from "@/shared/lib/axios";


export const profileService = {
  async getMyProfile() {
    const response = await apiClient.get('/profile');
    return response.data.data;
  },

 async updateMyProfile(data: {
    first_name: string;
    last_name: string;
    user_name: string; 
    email: string;
    department?: string;
    phone_crm?: string;
  }) {
    await apiClient.put('/profile', data);
  },
};