import { RoleNodeItem } from './RoleNodeItem';
import type {  RoleNodeChildrenProps } from './types';



export const RoleNodeChildren = ({
  children,
  onEdit,
  onDelete,
  onAssignProfile,
  profiles
}: RoleNodeChildrenProps) => (
  <div className="border-t bg-muted/20">
    <div className="pl-8 border-l border-muted ml-6 mt-2 mb-2">
      {children.map(child => (
        <div key={child.roleid} className="mb-2">
          <RoleNodeItem node={child} onEdit={onEdit} onDelete={onDelete} onAssignProfile={onAssignProfile} profiles={profiles} />
        </div>
      ))}
    </div>
  </div>
);