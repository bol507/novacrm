import { useMemo } from 'react';
import type { Role } from '../../../types/settings';
import type { RoleNode } from '../types';

export const useRoleHierarchy = (flatRoles: Role[]): RoleNode[] => {
  return useMemo(() => {
    if (flatRoles.length === 0) return [];

    const map = new Map<string, RoleNode>();
    const roots: RoleNode[] = [];

    flatRoles.forEach(role => {
      map.set(role.roleid, { ...role, children: [] });
    });

    flatRoles.forEach(role => {
      const node = map.get(role.roleid);
      if (!node) return;

      const parts = role.parentrole.split('::').filter(Boolean);
      const parentId = parts.length > 1 ? parts[parts.length - 2] : null;

      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId);
        parent?.children?.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [flatRoles]);
};