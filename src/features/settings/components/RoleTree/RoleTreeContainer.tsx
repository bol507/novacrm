import { RoleTree } from './RoleTree';
import { useRoleHierarchy } from './hooks/useRoleHierarchy';
import type { RoleTreeProps } from './types';

export const RoleTreeContainer = ({ roles, onEdit, onDelete, onAssignProfile, profiles }: RoleTreeProps) => {
  const treeData = useRoleHierarchy(roles);

  return (
    <RoleTree
      roles={treeData}
      onEdit={onEdit}
      onDelete={onDelete}
      onAssignProfile={onAssignProfile}
      profiles={profiles}
    />
  );
};