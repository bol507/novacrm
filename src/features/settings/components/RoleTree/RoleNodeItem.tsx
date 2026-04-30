import { useState } from 'react';
import { RoleNodeHeader } from './RoleNodeHeader';
import { RoleNodeChildren } from './RoleNodeChildren';
import type { RoleNodeItemProps } from './types';

export const RoleNodeItem = ({ node, onEdit, onDelete, onAssignProfile, profiles }: RoleNodeItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="rounded-md border bg-card group">
      <RoleNodeHeader
        node={node}
        isOpen={isOpen}
        hasChildren={hasChildren}
        onToggle={() => setIsOpen(!isOpen)}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssignProfile={onAssignProfile}
        profiles={profiles}
      />

      {hasChildren && isOpen && (
        <RoleNodeChildren
          children={node.children!}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignProfile={onAssignProfile}
          profiles={profiles}
        />
      )}
    </div>
  );
};