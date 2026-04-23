import  apiClient  from '@/shared/lib/axios';
import type { Role, Profile, CreateRoleRequest, UpdateRoleRequest, UpdateProfileRequest, CreateProfileRequest } from '../types/settings';
//  Base paths 
const ROLES_API = '/settings/roles';      // → /api/settings/roles 
const PROFILES_API = '/settings/profiles'; // → /api/settings/profiles
export const settingsService = {
  //  Roles CRUD
  getRoles: () => apiClient.get<Role[]>(ROLES_API), //  GET /api/settings/roles
  createRole: (data: CreateRoleRequest) => apiClient.post<Role>(ROLES_API, data),
  updateRole: (id: string, data: UpdateRoleRequest) => apiClient.put<Role>(`${ROLES_API}/${id}`, data),
  deleteRole: (id: string) => apiClient.delete(`${ROLES_API}/${id}`),
  
  //  Perfiles CRUD
   getProfiles: () => apiClient.get<Profile[]>(PROFILES_API).then(res => res.data.data),
  updateProfile: (id: string, data: UpdateProfileRequest) => apiClient.put<Profile>(`${PROFILES_API}/${id}`, data),
  createProfile: (data: CreateProfileRequest) => apiClient.post<Profile>(PROFILES_API, data),
  
  //  Rol ↔ Perfil
  assignProfileToRole: (roleId: string, profileId: string) => 
    apiClient.put(`${ROLES_API}/${roleId}/profile`, { profile_id: profileId }), //  PUT /api/settings/roles/{id}/profile
  
  getRoleProfile: (roleId: string) => 
    apiClient.get<{ profileid: string; name: string }>(`${ROLES_API}/${roleId}/profile`), //  GET /api/settings/roles/{id}/profile
};