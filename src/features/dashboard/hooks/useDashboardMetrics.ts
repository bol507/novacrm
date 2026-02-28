import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { DashboardMetrics } from '../types/dashboard';

/**
 * Hook para obtener métricas del dashboard
 * 
 * @returns Query result con métricas agregadas
 */
export const useDashboardMetrics = () => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};