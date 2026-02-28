import apiClient from '@/shared/lib/axios';
import type { CreateProjectData, ProjectFilters, ProjectResponse, UpdateProjectData } from '../types/projects';



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
    if (filters.clientId) params.append('client_id', filters.clientId.toString());
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

    const response = await apiClient.get<ProjectResponse>('/projects', {
      params,
      signal,
    });

    return response.data;
  },

  /**
   * get a project by ID
   */
  getProjectById: async (projectId: number) => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  /**
   * create a new project
   */
  createProject: async (data: CreateProjectData) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  /**
   * update a project
   */
  updateProject: async (projectId: number, data: UpdateProjectData) => {
    const response = await apiClient.put(`/projects/${projectId}`, data);
    return response.data;
  },

  /**
   * delete a project
   */
  deleteProject: async (projectId: number) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  },
};