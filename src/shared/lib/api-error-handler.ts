import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api-error';

/**
 * Extract user-friendly error message from AxiosError
 * 
 * @param error - The AxiosError to parse
 * @param fallback - Default message if no error found
 * @returns User-friendly error message
 */
export const getApiErrorMessage = (
  error: AxiosError<ApiErrorResponse>,
  fallback: string = 'An unexpected error occurred'
): string => {
  const apiError = error.response?.data;
  
  if (apiError?.error) return apiError.error;
  if (apiError?.message) return apiError.message;
  
  return fallback;
};