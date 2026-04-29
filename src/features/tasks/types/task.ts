export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
  dueDate: string;
  dueTime?: string;
  startDate: string;
  startTime?: string;
  location?: string;
  relatedRecordId?: number;
  relatedModuleType?: string;
  assignedUserId: number;
  assignedUserName?: string;
  assignedUserEmail?: string;
  createdByUserId: number;
  createdByName?: string;
  completed: boolean;
  isOverdue: boolean;
  isHighPriority: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskViewMode = "cards" | "table";

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  assignedTo?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  relatedModule?: string;
  relatedRecordId?: number;
}

export interface CreateTaskRequest {
  subject: string;
  dateStart: string;
  dueDate?: string;
  timeStart?: string;
  timeEnd?: string;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
  location?: string;
  description?: string;
  assignedUserId?: number;
  relatedRecordId?: number;
  relatedModuleType?: string;
  sendNotification?: boolean;
}

export interface UpdateTaskRequest {
  subject?: string;
  date_start?: string;        
  due_date?: string | null;   
  time_start?: string | null;
  time_end?: string | null;
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
  location?: string | null;
  description?: string | null;
  assigned_user_id?: number;
  related_record_id?: number | null;
  related_module_type?: string | null;
  send_notification?: boolean;
}

// ============================================================================
// TASK CREATION TYPES
// ============================================================================

export interface CreateTaskPayload {
  subject: string;
  date_start: string;              // YYYY-MM-DD
  due_date?: string | null;        // YYYY-MM-DD, optional
  time_start?: string | null;      // HH:MM, optional
  time_end?: string | null;        // HH:MM, optional
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
  location?: string | null;
  description?: string | null;
  related_record_id?: number | null;
  related_module_type?: string | null;
  send_notification?: boolean;
  assigned_user_id?: number; 
}

export interface CreateTaskResponse {
  message: string;
  data: Task | null;
}

// ============================================================================
// TASK UPDATE & DELETE TYPES
// ============================================================================

export interface UpdateTaskPayload {
  subject?: string;
  date_start?: string;              // YYYY-MM-DD
  due_date?: string | null;         // YYYY-MM-DD, optional
  time_start?: string | null;       // HH:MM, optional
  time_end?: string | null;         // HH:MM, optional
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
  location?: string | null;
  description?: string | null;
  assigned_user_id?: number;
  related_record_id?: number | null;
  related_module_type?: string | null;
  send_notification?: boolean;
}

export interface UpdateTaskResponse {
  message: string;
  data: Task | null;
}

export interface DeleteTaskResponse {
  message: string;
}

export interface TaskActionPayload {
  taskId: number;
  completed?: boolean;              // For toggle completion
  status?: string;                  // For status change
}




// ============================================================================
// COMMENTTYPES
// ============================================================================

export interface Comment {
  id: number;
  taskId: number;
  content: string;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;   // YYYY-MM-DD HH:MM:SS
  updatedAt: string;   // YYYY-MM-DD HH:MM:SS
  parentCommentId: number | null;
  isPrivate: boolean;
  attachment: string | null;
  isReply: boolean;
  authorName: string;
  formattedCreatedAt: string;  // DD/MM/YYYY HH:mm
}

export interface CommentResponse {
  data: Comment[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  };
}

export interface CreateCommentPayload {
  content: string;
  parent_comment_id?: number | null;
  is_private?: boolean;
  attachment?: string | null;
}


// ============================================================================
// ATTACHMENT TYPES
// ============================================================================

export interface Attachment {
  id: number;
  name: string;
  mimeType: string;              
  size: number;
  path?: string;                 
  description?: string | null;
  googleDriveId?: string;        
  url: string;                   
  viewUrl: string;               
  relatedRecordId: number;
  module: string;
  createdAt: string;             // YYYY-MM-DD HH:MM:SS
  uploadedBy?: number;           
}

export interface AttachmentResponse {
  data: Attachment[];
  total: number;
}

export interface UploadAttachmentPayload {
  file: File;
  description?: string;
}