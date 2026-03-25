// For quick reference when building components

// Dashboard metrics (KPIs)
export interface DashboardMetrics {
  activeClients: number;
  monthlySales: number;
  totalQuotes: number;
  conversionRate: number;
  pendingTasks: number;
  overdueTasks: number;
}

// Chart data points
export interface ActivityDataPoint {
  name: string;
  ventas: number;
  leads: number;
}

// Chart response structure
export interface ActivityDataResponse {
  data: ActivityDataPoint[];
  period: string;
  summary: {
    totalSales: number;
    totalLeads: number;
  };
}

// Individual task for widget
export interface DashboardTask {
  id: number;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
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
  completed: boolean;
  isOverdue: boolean;
  isHighPriority: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tasks API response
export interface DashboardTasksResponse {
  data:DashboardTask[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
  };
}

// Time period filters
export type TimePeriod = '7days' | '30days' | '90days' | '12months';
export interface PeriodOption {
  label: string;
  value: TimePeriod;
}