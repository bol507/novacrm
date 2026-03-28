export type SearchModuleType = 
  | 'project' 
  | 'client' 
  | 'opportunity' 
  | 'quote' 
  | 'task' 
  | 'contact';

export interface SearchResultItem {
  id: number;
  type: SearchModuleType;
  title: string;
  number?: string;
  client?: string;
  status?: string;
  amount?: string;
  total?: string;
  email?: string;
  phone?: string;
  company?: string;
  description?: string;
  due_date?: string;
  url: string;
}

export interface SearchResultsByModule {
  projects: SearchResultItem[];
  clients: SearchResultItem[];
  opportunities: SearchResultItem[];
  quotes: SearchResultItem[];
  tasks: SearchResultItem[];
  contacts: SearchResultItem[];
}

export interface GlobalSearchResponse {
  results: SearchResultsByModule;
  total: number;
  query: string;
}

export interface ModuleConfig {
  label: string;
  color: string;
  icon: string;
  route: string;
}

export const MODULE_CONFIG: Record<SearchModuleType, ModuleConfig> = {
  project: {
    label: 'Proyectos',
    color: 'bg-blue-500',
    icon: '📋',
    route: '/dashboard/projects',
  },
  client: {
    label: 'Clientes',
    color: 'bg-green-500',
    icon: '🏢',
    route: '/dashboard/clients',
  },
  opportunity: {
    label: 'Oportunidades',
    color: 'bg-purple-500',
    icon: '💰',
    route: '/dashboard/opportunities',
  },
  quote: {
    label: 'Cotizaciones',
    color: 'bg-yellow-500',
    icon: '📄',
    route: '/dashboard/quotes',
  },
  task: {
    label: 'Tareas',
    color: 'bg-red-500',
    icon: '✓',
    route: '/dashboard/tasks',
  },
  contact: {
    label: 'Contactos',
    color: 'bg-pink-500',
    icon: '👤',
    route: '/dashboard/contacts',
  },
};