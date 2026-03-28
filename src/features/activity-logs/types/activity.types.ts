/**
 * Types of activity actions.
 * Maps directly to status codes in vtiger_modtracker_basic:
 * - 0: created
 * - 1: updated
 * - 2: deleted
 * - 3: restored
 * - 4: transferred
 */
export type ActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'restored' 
  | 'transferred';

/**
 * Supported entity types.
 * Maps to Vtiger modules via ENTITY_CONFIG.
 * 
 * Frontend type → Vtiger module mapping:
 * - 'client' → 'Accounts'
 * - 'project' → 'Project'
 * - 'quote' → 'Quotes'
 * - 'task' → 'Tasks' (independent) or 'ProjectTask' (project task)
 * - 'opportunity' → 'Potentials'
 * - 'contact' → 'Contacts'
 * - 'comment' → 'ModComments' 
 * - 'activity' → 'Calendar'
 */
export type EntityType = 
  | 'client' 
  | 'project' 
  | 'quote' 
  | 'activity' 
  | 'opportunity' 
  | 'contact'
  | 'task'
  | 'comment';

/**
 * Information about the user who performed the action.
 */
export interface ActivityUser {
  id: number;
  name: string;
  avatar: string | null;
}

/**
 * Individual activity record.
 * Maps directly to ActivityLog.toArray() from the backend.
 */
export interface ActivityLog {
  /** Unique activity identifier */
  id: number;
  
  /** User who performed the action */
  user: ActivityUser;
  
  /** Type of action (created, updated, etc.) */
  action: ActivityAction;
  
  /** Human-readable action label (e.g., "Created") */
  action_label: string;
  
  /** Action verb (e.g., "created") */
  action_verb: string;
  
  /** Type of entity (project, client, etc.) */
  entity_type: EntityType;
  
  /** Human-readable entity type label (e.g., "Project") */
  entity_label: string;
  
  /** Entity icon (e.g., "📋") */
  entity_icon: string;
  
  /** Color class for the entity (e.g., "text-purple-500") */
  entity_color: string;
  
  /** ID of the affected entity */
  entity_id: number;
  
  /** Name of the entity (e.g., "Project XYZ") */
  entity_name: string;
  
  /** Full activity description */
  description: string;
  
  /** Creation date in ISO8601 format */
  created_at: string;
  
  /** Human-readable relative time (e.g., "5 minutes ago") */
  time_ago: string;
}

/**
 * API response for activity list.
 */
export interface ActivityLogsResponse {
  /** List of activities */
  activities: ActivityLog[];
  
  /** Total number of activities returned */
  total: number;
}

/**
 * Visual configuration by entity type.
 * Used as fallback when the backend does not provide this data.
 */
export const ENTITY_CONFIG: Record<EntityType, { 
  label: string; 
  icon: string; 
  color: string;
  bg_color: string;
}> = {
  client: { 
    label: 'Client', 
    icon: '🏢', 
    color: 'text-blue-500',
    bg_color: 'bg-blue-500/10',
  },
  project: { 
    label: 'Project', 
    icon: '📋', 
    color: 'text-purple-500',
    bg_color: 'bg-purple-500/10',
  },
  quote: { 
    label: 'Quote', 
    icon: '📄', 
    color: 'text-yellow-500',
    bg_color: 'bg-yellow-500/10',
  },
  activity: { 
    label: 'Activity', 
    icon: '✓', 
    color: 'text-green-500',
    bg_color: 'bg-green-500/10',
  },
  opportunity: { 
    label: 'Opportunity', 
    icon: '💰', 
    color: 'text-orange-500',
    bg_color: 'bg-orange-500/10',
  },
  contact: { 
    label: 'Contact', 
    icon: '👤', 
    color: 'text-pink-500',
    bg_color: 'bg-pink-500/10',
  },
   task: { 
    label: 'Tarea', 
    icon: '✓', 
    color: 'text-green-500',
    bg_color: 'bg-green-500/10',
  },
  comment: { 
    label: 'Comentario', 
    icon: '💬', 
    color: 'text-gray-500' ,
    bg_color: 'bg-gray-500/10',
  },
};

/**
 * Visual configuration by action type.
 */
export const ACTION_CONFIG: Record<ActivityAction, { 
  label: string; 
  verb: string;
   variant: 'default' | 'secondary' | 'destructive' | 'outline'; 
}> = {
  created: { 
    label: 'Created', 
    verb: 'created',
    variant: 'default',
  },
  updated: { 
    label: 'Updated', 
    verb: 'updated',
    variant: 'default',
  },
  deleted: { 
    label: 'Deleted', 
    verb: 'deleted',
    variant: 'destructive',
  },
  restored: { 
    label: 'Restored', 
    verb: 'restored',
    variant: 'outline',
  },
  transferred: { 
    label: 'Transferred', 
    verb: 'transferred',
    variant: 'default',
  },
}

export const getEntityConfig = (type: string) => {
  return ENTITY_CONFIG[type as EntityType] ?? {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: '📄',
    color: 'text-gray-500',
    bg_color: 'bg-gray-500/10',
  };
};