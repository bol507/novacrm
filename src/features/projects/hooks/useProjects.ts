import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import type { Project, ProjectFilters, ProjectResponse } from '../types/projects';
import { projectService } from '../services/projectService';

/**
 * Hook personalizado para obtener proyectos con paginación y búsqueda
 * 
 * @param page - Número de página (1-based)
 * @param limit - Límite de resultados por página
 * @param searchTerm - Término de búsqueda opcional
 * @param filters - Filtros adicionales opcionales (estado, prioridad, etc.)
 * @param options - Opciones adicionales de React Query
 * 
 * @returns Query result con datos tipados, estados de carga y errores
 * 
 * @example
 * const { data, isLoading, error } = useProjects(1, 10, 'cocina', { status: 'Active' });
 * 
 * @see {@link ProjectFilters} para filtros disponibles
 * @see {@link ProjectResponse} para estructura de respuesta
 */
export const useProjects = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  filters?: Partial<ProjectFilters>,
  options?: Omit<
    UseQueryOptions<ProjectResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  // ✅ Validación segura de parámetros
  const validatedPage = useMemo(() => {
    const p = Number(page);
    return Number.isNaN(p) || p < 1 ? 1 : p;
  }, [page]);

  const validatedLimit = useMemo(() => {
    const l = Number(limit);
    return Number.isNaN(l) || l < 1 ? 10 : Math.min(100, Math.max(1, l));
  }, [limit]);

  const validatedSearchTerm = useMemo(() => {
    const term = searchTerm ?? '';
    return typeof term === 'string' ? term.trim() : '';
  }, [searchTerm]);

  const queryFilters = useMemo<ProjectFilters>(() => ({
    page: validatedPage,
    limit: validatedLimit,
    search: validatedSearchTerm || undefined,
    status: filters?.status,
    priority: filters?.priority,
    assignedTo: filters?.assignedTo,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    clientId: filters?.clientId,
    sortBy: filters?.sortBy || 'createdtime',
    sortOrder: filters?.sortOrder || 'DESC',
  }), [validatedPage, validatedLimit, validatedSearchTerm, filters]);

  return useQuery<ProjectResponse, AxiosError>({
    queryKey: ['projects', queryFilters],
    queryFn: async ({ signal }) => {
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }
      
      try {
        const response = await projectService.getProjects(queryFilters, signal);
        return response;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request cancelled by user');
        }
        throw error;
      }
    },
    // ✅ Configuración de caché optimizada
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos (React Query v4+)
    
    // ✅ CORRECCIÓN: Mantener datos previos mientras se cargan nuevos
    placeholderData: (previousData: ProjectResponse | undefined) => previousData,
    
    // ✅ No mostrar estado de carga inicial si ya hay datos en caché
    initialData: () => {
      // Opcional: cargar datos iniciales desde caché si existen
      return undefined;
    },
    
    // ✅ Retry inteligente
    retry: (failureCount, error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status && error.response.status >= 400) {
          return false;
        }
        return failureCount < 3;
      }
      return failureCount < 3;
    },
    
    // ✅ Habilitar query solo con parámetros válidos
    enabled: validatedPage > 0 && validatedLimit > 0,
    
    // ✅ Permitir sobreescribir opciones desde el consumidor
    ...options,
  });
};


/**
 * Hook helper para obtener proyectos activos (en curso)
 * 
 * @param page - Número de página
 * @param limit - Límite de resultados
 * @param searchTerm - Término de búsqueda
 * @returns Query result con proyectos activos
 */
export const useActiveProjects = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ''
) => {
  return useProjects(page, limit, searchTerm, {
    status: 'Active', 
  });
};

/**
 * Hook helper para obtener proyectos completados
 */
export const useCompletedProjects = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ''
) => {
  return useProjects(page, limit, searchTerm, {
    status: 'Completed',
  });
};

/**
 * Hook helper para obtener proyectos por cliente
 */
export const useProjectsByClient = (
  clientId: number,
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ''
) => {
  return useProjects(page, limit, searchTerm, {
    clientId,
  });
};

/**
 * Selector de utilidad para extraer proyectos del resultado
 * 
 * @param data - Resultado de useProjects
 * @returns Array de proyectos o array vacío
 */
export const selectProjects = (data?: ProjectResponse): Project[] => {
  return data?.data || [];
};

/**
 * Selector de utilidad para obtener métricas de paginación
 */
export const selectPagination = (data?: ProjectResponse) => {
  return {
    currentPage: data?.meta?.current_page || 1,
    totalPages: data?.meta?.last_page || 1,
    totalItems: data?.meta?.total || 0,
    perPage: data?.meta?.per_page || 10,
    hasNextPage: (data?.meta?.current_page || 1) < (data?.meta?.last_page || 1),
    hasPreviousPage: (data?.meta?.current_page || 1) > 1,
  };
};