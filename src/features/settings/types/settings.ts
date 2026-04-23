export interface Role {
  roleid: string;
  rolename: string;
  parentrole: string;
  depth: number;
  sharing_rule: number;
  children_count: number;
  users_count: number;
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

export interface Profile {
  profileid: string;
  name: string;
  modules: {
    tabid: number;
    name: string;
    permissions: ('read' | 'write' | 'create' | 'delete')[];
  }[];
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