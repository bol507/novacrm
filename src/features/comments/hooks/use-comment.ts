import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { commentService } from '@/features/comments/services/commentService';
import type { ApiErrorResponse } from '@/shared/types/api-error';
import type { ProjectComment } from '../types/comment';

/**
 * Hook para obtener un solo comentario por su ID
 * 
 * @param commentId - ID único del comentario a recuperar
 * @param options - Opciones adicionales de React Query
 * @returns Query result con el comentario o undefined si no existe
 */
export const useComment = (
  commentId: number,
  options?: Omit<
    UseQueryOptions<Comment, AxiosError<ApiErrorResponse>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<Comment, AxiosError<ApiErrorResponse>>({
    queryKey: ['comment', commentId],  
    queryFn: async ({ signal }) => {
      if (signal?.aborted) throw new Error('Request cancelled');
      return await commentService.getCommentById(commentId, signal);
    },
    staleTime: 5 * 60 * 1000,  
    gcTime: 10 * 60 * 1000,
    enabled: commentId > 0,   
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return false;  
      }
      if (error instanceof AxiosError && error.response?.status && error.response.status >= 400) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};

/**
 * Extract comments array - versión infalible para cualquier estructura
 */
export const selectComments = (response: any): ProjectComment[] => {
  // Debug temporal para ver qué estamos recibiendo
  console.log('🔍 selectComments input:', {
    type: typeof response,
    isArray: Array.isArray(response),
    hasData: response?.data !== undefined,
    responseData: response?.data,
  });

  // Caso 1: null/undefined
  if (!response) {
    console.log('→ Response is null/undefined, returning []');
    return [];
  }
  
  // Caso 2: YA ES array directo ← ESTE ES TU CASO
  if (Array.isArray(response)) {
    console.log('→ Response is direct array, returning it');
    return response as ProjectComment[];
  }
  
  // Caso 3: {  [...] }
  if (Array.isArray(response.data)) {
    console.log('→ Response.data is array, returning it');
    return response.data;
  }
  
  // Caso 4: {  {  [...] } } (ApiResponse wrapper)
  if (response.data?.data && Array.isArray(response.data.data)) {
    console.log('→ Response.data.data is array, returning it');
    return response.data.data;
  }
  
  // Caso 5: { comments: [...] }
  if (response?.comments && Array.isArray(response.comments)) {
    console.log('→ Response.comments is array, returning it');
    return response.comments;
  }
  
  // Fallback
  console.log('→ Fallback: returning []');
  return [];
};

/**
 * Extract pagination metadata from query response
 * 
 * @param response - The query response (any structure)
 * @returns Pagination metadata or default values
 */
export const selectCommentsMeta = (response?: any) => {
  const defaults = { 
    current_page: 1, 
    per_page: 50, 
    total: 0, 
    last_page: 1, 
    has_more: false 
  };
  
  if (!response) return defaults;
  
  // Si response es array directo, construir meta básico
  if (Array.isArray(response)) {
    return { 
      ...defaults, 
      per_page: response.length, 
      total: response.length 
    };
  }
  
  // Estructura {  [...], meta: {...} }
  if (response?.meta) return response.meta;
  
  // ApiResponse wrapper: {  {  [...] }, meta: {...} }
  if (response?.data?.meta) return response.data.meta;
  
  return defaults;
};