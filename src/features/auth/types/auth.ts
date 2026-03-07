/**
 * User entity for authentication context
 * 
 * This is a simplified version of the full User entity,
 * containing only the fields needed for authentication and authorization.
 * 
 * @see \App\Domain\Entities\User (backend entity)
 * @see \App\Infrastructure\Mappers\UserMapper (mapping logic)
 */
export interface User {
  /** Unique user identifier */
  id: number;
  
  /** Username for authentication (login) */
  user_name: string;
  
  /** User's first name */
  first_name: string;
  
  /** User's last name */
  last_name: string;
  
  /** User's email address */
  email: string;
  
  /** User's role in the system (required for authorization) */
  role: 'Admin' | 'Usuario' | 'Cliente';
  
  /** Whether the user account is active */
  is_active?: boolean;
}

/**
 * Response structure for authentication endpoints
 * 
 * @example
 * {
 *   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
 *   "token_type": "Bearer",
 *   "expires_in": 3600,
 *   "user": {
 *     "id": 5,
 *     "user_name": "johndoe",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "email": "john@example.com",
 *     "role": "Admin",
 *     "is_active": true
 *   }
 * }
 */
export interface AuthResponse {
  /** JWT access token */
  access_token: string;
  
  /** Token type (typically "Bearer") */
  token_type?: string;
  
  /** Token expiration time in seconds */
  expires_in?: number;
  
  /** Authenticated user information */
  user: User;
}

/**
 * Login request payload
 * 
 * @example
 * {
 *   "user_name": "johndoe",
 *   "password": "secret123"
 * }
 */
export interface LoginCredentials {
  user_name: string;
  password: string;
}