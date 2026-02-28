export interface Project {
  projectid: number;
  project_no: string;
  projectname: string;
  projectstatus: string;
  projectpriority: string;
  projecttype?: string;
  startdate?: string;
  targetenddate?: string;
  actualenddate?: string;
  targetbudget?: string;
  progress: string;
  description?: string;
  linktoaccountscontacts?: number;
  account_name?: string;
  assigned_user_id: number;
  assigned_user_name?: string;
  hits?: number;
  totalTasks?: number;
  completedTasks?: number;
  createdtime?: string;
  modifiedtime?: string;
  smcreatorid?: number;
  smownerid?: number;
}

export interface ProjectFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: number;
  startDate?: string;
  endDate?: string;
  clientId?: number;
  sortBy?: 'createdtime' | 'projectname' | 'targetenddate' | 'progress';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateProjectData {
  projectname: string;
  accountid: number;
  assigned_user_id: number | null;
  projectstatus?: string;
  projectpriority?: string;
  projecttype?: string;
  startdate?: string;
  targetenddate?: string;
  targetbudget?: string;
  projecturl?: string;
  description?: string;
  potentialid?: number | null;
  quoteid?: number | null;
}

export interface UpdateProjectData {
  projectname?: string;
  accountid?: number;
  assigned_user_id?: number;
  projectstatus?: string;
  projectpriority?: string;
  projecttype?: string;
  startdate?: string;
  targetenddate?: string;
  actualenddate?: string;
  targetbudget?: string;
  projecturl?: string;
  progress?: string;
  description?: string;
  potentialid?: number;
}

export interface ProjectResponse {
  data: Project[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}