/**
 * Standard API error response structure
 * 
 * Used for typing AxiosError responses across the application
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  messages?: Record<string, string[]>; // For validation errors
  [key: string]: unknown; // Allow additional properties
}