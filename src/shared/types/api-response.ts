/**
 * Standard API response wrapper for Laravel/Vtiger APIs
 * 
 * Most of our backend endpoints return responses in this format:
 * {
 *   message?: string;  // Optional success/info message
 *    T;          // The actual payload (entity, array, pagination object, etc.)
 * }
 * 
 * @template T - Type of the data payload
 * 
 * @example
 * // Single entity response
 * ApiResponse<User> → { message?: string;  User }
 * 
 * @example
 * // Paginated list response
 * ApiResponse<Paginated<Post>> → { message?: string;  Paginated<Post> }
 * 
 * @example
 * // Void/no-content response
 * ApiResponse<void> → { message?: string;  void }
 */
export interface ApiDataResponse<T> {
  message?: string;
   data: T;
}

/**
 * Standard API error response structure
 * 
 * Used for typing AxiosError responses across the application.
 * 
 * @example
 * // Simple error
 * { error: "Validation failed" }
 * 
 * @example
 * // Validation errors with field messages
 * { 
 *   error: "Validation failed",
 *   messages: {
 *     email: ["The email field is required"],
 *     password: ["The password must be at least 8 characters"]
 *   }
 * }
 */
export interface ApiErrorResponse {
  /**
   * General error message
   */
  error?: string;
  
  /**
   * Alternative error message field (some endpoints use 'message')
   */
  message?: string;
  
  /**
   * Field-specific validation errors
   */
  messages?: Record<string, string[]>;
  
  /**
   * Allow additional properties for flexibility
   */
  [key: string]: unknown;
}

/**
 * Paginated response wrapper
 * 
 * Combines ApiDataResponse with pagination metadata.
 * 
 * @template T - Type of items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

/**
 * Helper type for query hooks with ApiDataResponse
 * 
 * Usage in useQuery:
 * useQuery<ApiDataResponse<T>, AxiosError<ApiErrorResponse>>(...)
 */
export type ApiQueryResponse<T> = ApiDataResponse<T>;

/**
 * Helper type for mutation hooks with ApiDataResponse
 * 
 * Usage in useMutation:
 * useMutation<ApiDataResponse<T>, AxiosError<ApiErrorResponse>, Variables>(...)
 */
export type ApiMutationResponse<T> = ApiDataResponse<T>;