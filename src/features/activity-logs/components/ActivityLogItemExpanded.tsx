// src/features/activity-logs/components/ActivityLogItemExpanded.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ActivityLog } from '../types/activity.types';
import { getEntityConfig } from '../types/activity.types';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

interface ActivityLogItemExpandedProps {
  activity: ActivityLog;
  onClick?: (activity: ActivityLog) => void;
}

export const ActivityLogItemExpanded = ({ 
  activity, 
  onClick 
}: ActivityLogItemExpandedProps) => {
  const entityConfig = getEntityConfig(activity.entity_type);
  const userInitial = activity.user.name.charAt(0).toUpperCase();
  const [isExpanded, setIsExpanded] = useState(false);

  // Truncar descripción si es muy larga (más de 150 caracteres)
  const description = activity.description || activity.entity_name;
  const shouldTruncate = description.length > 150;
  const displayDescription = isExpanded || !shouldTruncate 
    ? description 
    : description.slice(0, 150) + '...';

  return (
    <div
      onClick={() => onClick?.(activity)}
      className={cn(
        'flex items-start gap-4 p-4 transition-colors',
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
      {/* Avatar del usuario */}
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={activity.user.avatar ?? undefined} alt={activity.user.name} />
        <AvatarFallback className="text-sm font-medium bg-muted">
          {userInitial}
        </AvatarFallback>
      </Avatar>

      {/* Contenido principal - Full width */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header: Usuario + Tipo de Entidad + Tiempo */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold text-foreground">
                {activity.user.name}
              </span>
              <span className="text-muted-foreground">
                {' '}
              </span>
              <span className={cn('font-medium', entityConfig.color)}>
                {entityConfig.icon} {entityConfig.label}
              </span>
            </p>
            
            {/* Nombre de la entidad */}
            <p className="text-sm font-medium text-foreground mt-0.5">
              {activity.entity_name}
            </p>
          </div>

          {/* Tiempo relativo */}
          <p className="text-xs text-muted-foreground shrink-0">
            {activity.time_ago}
          </p>
        </div>

        {/* Descripción extendida con ellipsis */}
        <div className="text-sm text-muted-foreground leading-relaxed">
          {displayDescription}
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="ml-1 text-primary hover:underline font-medium"
            >
              {isExpanded ? 'ver menos' : 'ver más'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};