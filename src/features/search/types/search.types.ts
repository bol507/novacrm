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
  results: {
    projects?: Array<any>;
    clients?: Array<any>;
    opportunities?: Array<any>;
    quotes?: Array<any>;
    tasks?: Array<any>;
    contacts?: Array<any>;
    [key: string]: any[] | undefined; 
  };
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

/**
 * Raw backend search results (Vtiger-native field names)
 * This is what the API actually returns before transformation
 */
export type RawBackendSearchResults = {
  projects?: Array<{
    projectid: number;
    projectname: string;
    project_no?: string;
    projectstatus?: string;
    accountname?: string | null;
    [key: string]: any;
  }>;
  clients?: Array<{
    accountid: number;
    accountname: string;
    account_no?: string;
    email1?: string;
    phone?: string;
    description?: string;
    [key: string]: any;
  }>;
  opportunities?: Array<{
    potentialid: number;
    potentialname: string;
    potential_no?: string;
    sales_stage?: string;
    related_to_name?: string;
    amount?: string;
    [key: string]: any;
  }>;
  quotes?: Array<{
    quoteid: number;
    subject: string;
    quote_no?: string;
    quotestage?: string;
    accountname?: string;
    total?: string;
    [key: string]: any;
  }>;
  tasks?: Array<{
    id: number;
    title?: string;
    subject?: string;
    description?: string;
    due_date?: string;
    status?: string;
    url?: string;
    [key: string]: any;
  }>;
  contacts?: Array<{
    contactid: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    accountname?: string;
    [key: string]: any;
  }>;
  [key: string]: any[] | undefined;
};