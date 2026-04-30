export interface Role {
  roleid: string;
  rolename: string;
  parentrole: string;
  depth: number;
  sharing_rule: number;
  children_count: number;
  users_count: number;
  profile_id?: string;
}

export interface Profile {
  profileid: string;
  name: string;
  modules: Array<{
    tabid: number;
    name: string;
    permissions: ('read' | 'write' | 'create' | 'delete')[];
  }>;
}

export interface CreateRoleRequest {
  name: string;
  parent_id?: string | null;
}

export interface UpdateRoleRequest {
  name?: string;
  parent_id?: string | null;
  sharing_rule?: number;
}



export interface UpdateProfileRequest {
  name?: string;
  modules: {
    tabid: number;
    permissions: string[];
  }[];
}

export interface CreateProfileRequest {
  name: string;
  modules: {
    tabid: number;
    permissions: string[];
  }[];
}

export interface CreateProfileResult {
  profileid: string;
  name: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export const TABID_TO_MODULE_KEY = {
  // 📦 Core CRM (imprescindibles)
  6: 'accounts',          // Clientes
  4: 'contacts',          // Contactos
  7: 'leads',             // Leads
  9: 'calendar',          // Calendario
  2: 'potentials',        // Oportunidades
  20: 'quotes',           // Cotizaciones
  21: 'PurchaseOrder',    // Pedidos de compra
  23: 'invoices',         // Facturas
  
  // 📁 Proyectos (Vtiger los separa en 3)
  46: 'projects',         // Project
  45: 'project_tasks',    // ProjectTask
  44: 'project_milestones', // ProjectMilestone
  
  // 🛠️ Soporte & Catálogo
  13: 'helpdesk',         // Tickets/Soporte
  14: 'products',         // Productos
  34: 'services',         // Servicios
  18: 'vendors',          // Proveedores
  
  // 📊 Reportes & Extras (agrega solo si tienes rutas para ellos)
  25: 'reports',          // Reportes
  42: 'assets',           // Activos
  47: 'email_templates',  // Plantillas de correo
} as const;

export type ModuleKey = (typeof TABID_TO_MODULE_KEY)[keyof typeof TABID_TO_MODULE_KEY];

export type PermissionAction = 'read' | 'write' | 'create' | 'delete';

export const MODULE_KEY_TO_TABID: Record<ModuleKey, number> = Object.fromEntries(
  Object.entries(TABID_TO_MODULE_KEY).map(([tabid, key]) => [key, Number(tabid)])
) as Record<ModuleKey, number>

export interface ModulePermissionData {
  tabid: number;
  name?: string;           
  tablabel?: string;      
  permissions: PermissionAction[];
}

export interface ModulePermissionUpdate {
  tabid: number;
  permissions: PermissionAction[];
}

export interface ProfileFormValues {
  name: string;
  modules: ModulePermissionData[];  
}

