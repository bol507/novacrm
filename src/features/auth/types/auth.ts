/**
 * User entity for authentication context
 * 
 * This is a simplified version of the full User entity,
 * containing only the fields needed for authentication and authorization.
 * 
 * @see \App\Domain\Entities\User (backend entity)
 * @see \App\Infrastructure\Mappers\UserMapper (mapping logic)
 */


export type User = UserData;


export interface AuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
   user: {
    data: UserData;
  };
}

export interface LoginCredentials {
  user_name: string;
  password: string;
}

export interface UserData {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;

  is_admin: boolean;           
  role_id?: string | null;     
  rolename?: string | null;    

  status: string;
  department: string | null;
  phone: string | null;
  is_active: boolean;
}

export type ExtractUserData<T> = T extends { data: infer U } ? U : never;