import apiClient from "@/shared/lib/axios";
import type { NotificationListResponse } from "../types/notifications";

const NOTIFICATIONS_API = '/notifications';

export const notificationService = {
    list: async (params?: { 
        project_id?: number; 
        unread_only?: boolean; 
        page?: number;
        limit?: number;
    }) => {
        const response = await apiClient.get<NotificationListResponse>(NOTIFICATIONS_API, { params });
        if (!response.data.meta) {
            response.data.meta = { total: 0, unread_count: 0, per_page: 20, current_page: 1 };
        }
        return response;
    },

    markAsRead: (id: number) =>
        apiClient.post<{ message: string }>(`${NOTIFICATIONS_API}/${id}/read`),

    markAllAsRead: (projectId?: number) =>
        
        apiClient.post<{ message: string; updated_count: number }>(
            `${NOTIFICATIONS_API}/read-all`, 
            { project_id: projectId }
        ),

    delete: (id: number) =>
        apiClient.delete<{ message: string }>(`${NOTIFICATIONS_API}/${id}`),
};