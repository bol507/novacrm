import apiClient from '@/shared/lib/axios';
import type { CreateProjectData, Project, ProjectFilters, ProjectResponse, ProjectUpdateData } from '../types/projects';
import type { ProjectSearchResult } from '../hooks/use-search-projects';

const PROJECTS_API = '/projects';


export const projectService = {
  /**
   * get all projects with pagination and search
   */
  getProjects: async (
    filters: ProjectFilters,
    signal?: AbortSignal
  ): Promise<ProjectResponse> => {
    const params = new URLSearchParams();
    
   
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assigned_to', filters.assignedTo.toString());
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.clientId) params.append('account_id', filters.clientId.toString());
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

    const response = await apiClient.get<ProjectResponse>(PROJECTS_API, {
      params,
      signal,
    });

    return response.data;
  },

  /**
   * get a project by ID
   */
  getProjectById: async (projectId: number) => {
    const response = await apiClient.get(`${PROJECTS_API}/${projectId}`);
    return response.data;
  },

  /**
   * create a new project
   */
  createProject: async (data: CreateProjectData) => {
    const response = await apiClient.post(PROJECTS_API, data);
    return response.data;
  },

  /**
   * update a project
   */
  
  updateProject: async (
    projectId: number,
    data: ProjectUpdateData
  ): Promise<Project> => {
    const response = await apiClient.put<Project>(`${PROJECTS_API}/${projectId}`, data);
    return response.data;
  },

  /**
   * delete a project
   */
  deleteProject: async (projectId: number) => {
    const response = await apiClient.delete(`${PROJECTS_API}/${projectId}`);
    return response.data;
  },

  /**
   * Search projects by name or number.
   *
   * @param searchTerm - Search term to filter projects
   * @returns Promise resolving to array of project search results
   */
  async searchProjects(searchTerm: string): Promise<ProjectSearchResult[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const response = await apiClient.get(`${PROJECTS_API}/search`, {
      params: { search: searchTerm },
    });
    return response.data.data || response.data || [];
  },
};