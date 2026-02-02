export interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'Admin' | 'Usuario' | 'Cliente';
  status: string;
  phone_crm: string | null;
  department: string | null;
  reports_to_id: string | null;
  profileid: string | null;
  is_active: boolean;
}

export const USER_ROLES = ['Admin', 'Usuario', 'Cliente'] as const;