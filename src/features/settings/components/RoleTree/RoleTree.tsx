import { RoleNodeItem } from './RoleNodeItem';
import { EmptyState } from './EmptyState';
import type { RoleTreeProps } from './types';

export const RoleTree = ({ roles, onEdit, onDelete, onAssignProfile, profiles }: RoleTreeProps) => {
  if (roles.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      {roles.map(node => (
        <RoleNodeItem
          key={node.roleid}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignProfile={onAssignProfile}
          profiles={profiles}
        />
      ))}
    </div>
  );
};