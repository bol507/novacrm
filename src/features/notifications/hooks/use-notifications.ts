import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification-service';

export const useNotifications = {
    list: (params?: { project_id?: number; unread_only?: boolean }) => {
        return useQuery({
            queryKey: ['notifications', params],
            queryFn: () => notificationService.list(params).then(res => res.data),
            enabled: true,
            staleTime: 30 * 1000, // 30 segundos
            refetchInterval: 2 * 60 * 1000, // Polling cada 2 min (opcional)
        });
    },

    markAsRead: () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (id: number) => notificationService.markAsRead(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
            onError: (error) => {
                console.error('Error marking notification as read:', error);
            },
        });
    },

    markAllAsRead: () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (projectId?: number) => notificationService.markAllAsRead(projectId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
            onError: (error) => {
                console.error('Error marking all notifications as read:', error);
            },
        });
    },

    delete: () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (id: number) => notificationService.delete(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
        });
    },
};