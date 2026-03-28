import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ActivityLog } from '../types/activity.types';
import { ACTION_CONFIG, getEntityConfig } from '../types/activity.types';
import { cn } from '@/shared/lib/utils';

interface ActivityLogItemProps {
  /** Activity to render */
  activity: ActivityLog;
  
  /** Callback invoked when the activity is clicked (optional) */
  onClick?: (activity: ActivityLog) => void;
}

/**
 * Component for rendering an individual activity log item.
 *
 * Displays:
 * - User avatar
 * - User name and performed action
 * - Affected entity icon and name
 * - Action type badge
 * - Relative time (e.g., "5 minutes ago")
 *
 * @component
 * @param props - Component props
 * @param props.activity - Activity log data to display
 * @param props.onClick - Optional callback invoked when the item is clicked
 * @returns The rendered activity item
 *
 * @example
 * <ActivityLogItem activity={activity} onClick={handleClick} />
 */
export const ActivityLogItem = ({ activity, onClick }: ActivityLogItemProps) => {
  const entityConfig = getEntityConfig(activity.entity_type);
  const actionConfig = ACTION_CONFIG[activity.action] ?? ACTION_CONFIG.updated;

  const userInitial = activity.user.name.charAt(0).toUpperCase();

  const badgeClassName = cn(
    'text-xs shrink-0',
    `badge-${activity.action}`
  );

  return (
    <div
      onClick={() => onClick?.(activity)}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        onClick ? 'cursor-pointer hover:bg-muted/50' : ''
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(activity);
        }
      }}
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={activity.user.avatar ?? undefined} alt={activity.user.name} />
        <AvatarFallback className="text-xs font-medium bg-muted">
          {userInitial}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-foreground">
                {activity.user.name}
              </span>
              <span className="text-muted-foreground"> {activity.action_verb} </span>
              <span className={cn('font-medium', entityConfig.color)}>
                {entityConfig.icon} {entityConfig.label}
              </span>
            </p>
            
            <p className="text-xs text-muted-foreground mt-0.5 truncate" title={activity.entity_name}>
              {activity.entity_name}
            </p>
          </div>

          <Badge
            variant={actionConfig.variant}
            className={badgeClassName}
          >
            {actionConfig.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {activity.time_ago}
        </p>
      </div>
    </div>
  );
};