// src/features/notifications/types/notifications.ts
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type NotificationIcon = 'Package' | 'FileText' | 'CheckCircle' | 'AlertCircle' | 'Bell';

export interface Notification {
  id: number;
  project_id?: number;
  type: string;
  title: string;
  message: string;
  icon: NotificationIcon;
  severity: NotificationSeverity;
  entity_type?: string;
  entity_id?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  created_by: number;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: { 
    total: number; 
    unread_count: number
    per_page: number;
    current_page: number;
 };
}