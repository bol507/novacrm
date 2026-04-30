// features/roles/services/role-service.ts
import apiClient from "@/shared/lib/axios";
import type { Role } from "../types/role";
const ROLES_API = '/roles';
export const roleService = {
    /**
    * Fetches available hierarchical roles from Vtiger for dropdowns
    */
    async getAvailableRoles(): Promise<Role[]> {
        const response = await apiClient.get<{ data: Role[] }>(ROLES_API);
        return response.data.data;
    },

    /**
    * Assign a hierarchical role to a user
    */
    async assignRole(userId: number, roleId: string): Promise<void> {
        await apiClient.put(`${ROLES_API}/users/${userId}/role`, { role_id: roleId });
    },
}