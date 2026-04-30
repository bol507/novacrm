/**
 * User roles available in the system
 * 
 * This constant is used for:
 * - TypeScript type definitions
 * - Runtime validation
 * - Form dropdown options
 * - Permission checks
 */
export const USER_ROLES = ['Admin', 'Usuario', 'Cliente'] as const;

/**
 * User role type derived from USER_ROLES constant
 * 
 * This ensures type safety and consistency between
 * runtime values and compile-time types.
 */
export type UserRole = typeof USER_ROLES[number];

/**
 * User status options available in the system
 */
export const USER_STATUSES = ['Active', 'Inactive', 'Pending'] as const;

/**
 * User status type derived from USER_STATUSES constant
 */
export type UserStatus = typeof USER_STATUSES[number];

export type UserViewMode = "cards" | "table";

/**
 * User entity for frontend consumption
 * 
 * Represents a user in the CRM system with essential fields
 * for task assignment, display, and authorization purposes.
 * 
 * @see \App\Domain\Entities\User (backend entity)
 */
export interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;

  is_admin: boolean;           
  role_id?: string ;     
  rolename?: string ; 

  status: UserStatus;
  phone_crm?: string ;
  department?: string ;
  reports_to_id?: number ;
  profileid?: string ;
  is_active: boolean;

  created_at?: string;
  updated_at?: string;
}

/**
 * Response structure for user list endpoint
 * 
 * @example
 * {
 *   "data": [...],
 *   "meta": {
 *     "current_page": 1,
 *     "last_page": 5,
 *     "per_page": 10,
 *     "total": 50
 *   }
 * }
 */
export interface UsersResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
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

/**
 * Filters for user list endpoint
 */
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  isActive?: boolean;
  sortBy?: 'createdtime' | 'user_name' | 'first_name' | 'last_name' | 'email';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Request body for creating a new user
 */
export interface CreateUserRequest {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;

  is_admin?: boolean;
  role_id?: string;

  status?: UserStatus;
  password: string;
  phone_crm?: string;
  department?: string;
  reports_to_id?: number;
  
}

/**
 * Request body for updating an existing user
 */
export interface UpdateUserRequest {
  user_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;

  role_id?: string;
  is_admin?: boolean;

  status?: UserStatus;
  phone_crm?: string;
  department?: string;
  reports_to_id?: number;
  password?: string; // Only if changing password
}

/**
 * Helper function to validate if a role is valid
 * 
 * @param role - Role string to validate
 * @returns True if role is valid
 * 
 * @example
 * if (isValidUserRole(someRole)) {
 *   // TypeScript knows someRole is UserRole here
 * }
 */
export function isValidUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

/**
 * Helper function to validate if a status is valid
 * 
 * @param status - Status string to validate
 * @returns True if status is valid
 */
export function isValidUserStatus(status: string): status is UserStatus {
  return USER_STATUSES.includes(status as UserStatus);
}

/**
 * Get display label for a role (for UI dropdowns)
 * 
 * @param role - Role value
 * @returns Human-readable label
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    Admin: 'Administrador',
    Usuario: 'Usuario',
    Cliente: 'Cliente',
  };
  return labels[role] || role;
}

/**
 * Get display label for a status (for UI dropdowns)
 * 
 * @param status - Status value
 * @returns Human-readable label
 */
export function getStatusLabel(status: UserStatus): string {
  const labels: Record<UserStatus, string> = {
    Active: 'Activo',
    Inactive: 'Inactivo',
    Pending: 'Pendiente',
  };
  return labels[status] || status;
}

/**
 * Get color variant for a role (for UI badges)
 * 
 * @param role - Role value
 * @returns Color variant name
 */
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    Admin: 'destructive',
    Usuario: 'default',
    Cliente: 'secondary',
  };
  return colors[role] || 'default';
}

/**
 * Get color variant for a status (for UI badges)
 * 
 * @param status - Status value
 * @returns Color variant name
 */
export function getStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    Active: 'success',
    Inactive: 'secondary',
    Pending: 'warning',
  };
  return colors[status] || 'default';
}

export interface ChangePasswordRequest {
  new_password: string;
  confirm_password: string;
  current_password?: string; // Only if changing password
}