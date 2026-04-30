import apiClient from '@/shared/lib/axios';
import type {
  Role,
  Profile,
  CreateRoleRequest,
  UpdateRoleRequest,
  UpdateProfileRequest,
  ApiEnvelope
} from '../types/settings';

//  Base paths 
const ROLES_API = '/settings/roles';      // → /api/settings/roles 
const PROFILES_API = '/settings/profiles'; // → /api/settings/profiles

export const settingsService = {
  //  Roles CRUD
  getRoles: () => apiClient.get<ApiEnvelope<Role[]>>(ROLES_API), //  GET /api/settings/roles
  createRole: (data: CreateRoleRequest) => apiClient.post<ApiEnvelope<Role>>(ROLES_API, data), //  POST /api/settings/roles
  updateRole: (id: string, data: UpdateRoleRequest) => apiClient.put<ApiEnvelope<Role>>(`${ROLES_API}/${id}`, data), //  PUT /api/settings/roles/{id}
  deleteRole: (id: string) => apiClient.delete<ApiEnvelope<null>>(`${ROLES_API}/${id}`), //  DELETE /api/settings/roles/{id}

  //  Perfiles CRUD
  getProfiles: () => apiClient.get<ApiEnvelope<Profile[]>>(PROFILES_API).then(res => res.data),
  updateProfile: (id: string, data: UpdateProfileRequest) => apiClient.put<ApiEnvelope<Profile>>(`${PROFILES_API}/${id}`, data),
  createProfile: (data: { name: string; role_id?: string }) => apiClient.post<ApiEnvelope<Profile>>(PROFILES_API, data),

  //  Rol ↔ Perfil
  assignProfileToRole: (roleId: string, profileId: string) =>
    apiClient.put<ApiEnvelope<null>>(`${ROLES_API}/${roleId}/profile`, { profile_id: profileId }), //  PUT /api/settings/roles/{id}/profile

  getRoleProfile: (roleId: string) =>
    apiClient.get<ApiEnvelope<{ profileid: string; name: string }>>(`${ROLES_API}/${roleId}/profile`), //  GET /api/settings/roles/{id}/profile

  isRoleNameAvailable: (name: string, excludeId?: string) =>
    apiClient.get<{ available: boolean }>(`${ROLES_API}/check-name`, {
      params: { name, exclude_id: excludeId },
    }).then(res => res.data.available),


  isProfileNameAvailable: (name: string, excludeId?: string) =>
    apiClient.get<{ available: boolean }>(`${PROFILES_API}/check-name`, {
      params: { name, exclude_id: excludeId },
    }).then(res => res.data.available),

  getProfilePermissions: (profileId: string) =>
    apiClient.get<{ data: { modules: Array<{ tabid: number; name: string; permissions: string[] }> } }>(
      `${PROFILES_API}/${profileId}/permissions`
    ),
  
};