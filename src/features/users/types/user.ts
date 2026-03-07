/**
 * User entity for frontend consumption
 * 
 * Represents a user in the CRM system with essential fields
 * for task assignment, display, and authorization purposes.
 * 
 * @see \App\Domain\Entities\User (backend entity)
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
  
  /** User's role in the system */
  role: 'Admin' | 'Usuario' | 'Cliente';
  
  /** User's status (normalized to domain values) */
  status: 'Active' | 'Inactive' | 'Pending';
  
  /** User's phone number (optional) */
  phone_crm: string | null;
  
  /** User's department (optional) */
  department: string | null;
  
  /** ID of supervisor user (optional) */
  reports_to_id: number | null;
  
  /** User's profile ID (optional, Vtiger-specific) */
  profileid: string | null;
  
  /** Whether the user account is active */
  is_active: boolean;
}

/**
 * Response structure for user list endpoint
 * 
 * @example
 * {
 *   "users": [...],
 *   "total": 50,
 *   "page": 1,
 *   "perPage": 100
 * }
 */
export interface UsersResponse {
  users: User[];      
  total: number;
  page?: number;
  perPage?: number;
}
/**
 * Response structure for single user endpoint
 * 
 * @example
 * {
 *   "data": { id: 5, first_name: "John", ... }
 * }
 */
export interface UserResponse {
   data: User;          
}