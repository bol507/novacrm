import type { Role } from '../../types/settings';

export interface RoleNode extends Role {
  children?: RoleNode[];
}

export interface RoleTreeProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onAssignProfile?: (roleId: string, profileId: string) => void; 
  profiles?: Array<{ profileid: string; name: string }>;
}

export interface RoleNodeItemProps {
  node: RoleNode;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onAssignProfile?: (roleId: string, profileId: string) => void; 
  profiles?: Array<{ profileid: string; name: string }>;
}

export interface RoleNodeHeaderProps {
  node: RoleNode;
  isOpen: boolean;
  hasChildren?: boolean;
  onToggle: () => void;
  onEdit: (role: RoleNode) => void;
  onDelete: (roleId: string) => void;
  onAssignProfile?: (roleId: string, profileId: string) => void; 
  profiles?: Array<{ profileid: string; name: string }>;
}

export interface RoleNodeChildrenProps {
  children: RoleNode[];
  onEdit: (role: RoleNode) => void;
  onDelete: (roleId: string) => void;
  onAssignProfile?: (roleId: string, profileId: string) => void; 
  profiles?: Array<{ profileid: string; name: string }>; 
}