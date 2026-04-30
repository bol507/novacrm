


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
  profile_id?: number | null;

  status: string;
  department: string | null;
  phone: string | null;
  is_active: boolean;

  //  (backend-agnostic)
  permissions?: Record<number, { 
    read: boolean; 
    write: boolean; 
    create: boolean; 
    delete: boolean; 
  }>;
  
  //  (backend-specific)
  available_modules?: Record<number, { 
    name: string; 
    tablabel: string;
    sequence: number;
  }>;
}

export type ExtractUserData<T> = T extends { data: infer U } ? U : never;