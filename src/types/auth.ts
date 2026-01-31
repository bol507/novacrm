export interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface LoginCredentials {
  user_name: string;
  password: string;
}