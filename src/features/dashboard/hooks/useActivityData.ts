import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/axios';
import type { ActivityDataResponse, TimePeriod } from '../types/dashboard';

/**
 * Hook para obtener datos del gráfico de actividad
 * 
 * @param period - Período de tiempo: '7days', '30days', '90days', '12months'
 * @returns Query result con datos para el gráfico
 */
export const useActivityData = (period: TimePeriod = '12months') => {
  return useQuery<ActivityDataResponse>({
    queryKey: ['dashboard', 'activity', period],
    queryFn: async () => {
      const response = await apiClient.get<ActivityDataResponse>(
        `/dashboard/activity?period=${period}`
      );
      return response.data;
    },
    
    staleTime: 5 * 60 * 1000, // 5 minutos: datos "frescos"
    gcTime: 10 * 60 * 1000,   // 10 minutos: tiempo antes de eliminar caché inactivo
    
    
    placeholderData: (previousData: ActivityDataResponse | undefined) => previousData,
    
    
    retry: (failureCount, error: any) => {
      // No reintentar errores de aplicación (4xx)
      if (error?.response?.status && error.response.status >= 400) {
        return false;
      }
      // Reintentar hasta 3 veces para errores de red
      return failureCount < 3;
    },
  });
};