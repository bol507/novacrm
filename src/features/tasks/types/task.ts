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

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned';
}