// Metricas del dashboard
export interface DashboardMetrics {
  activeClients: number;
  monthlySales: number;
  totalQuotes: number;
  conversionRate: number;
  pendingTasks: number;
  overdueTasks: number;
}

// Punto de datos para el gráfico de actividad
export interface ActivityDataPoint {
  name: string;
  ventas: number;
  leads: number;
}

// Respuesta completa del endpoint de actividad
export interface ActivityDataResponse {
  data: ActivityDataPoint[];
  period: string;
  summary: {
    totalSales: number;
    totalLeads: number;
  };
}

// Tarea para el widget del dashboard
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

// Respuesta del endpoint de tareas del dashboard
export interface DashboardTasksResponse {
  data: DashboardTask[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
  };
}

// Períodos de tiempo para filtros
export type TimePeriod = '7days' | '30days' | '90days' | '12months';

// Opciones para el selector de período
export interface PeriodOption {
  label: string;
  value: TimePeriod;
}