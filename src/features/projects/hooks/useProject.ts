import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { Project, ProjectUpdateData } from '../types/projects';
import { projectService } from '../services/projectService';

/**
 * React Query hook for fetching a single project by its unique identifier.
 * 
 * This hook manages the asynchronous retrieval of project data from the API,
 * including loading states, error handling, and automatic caching via React Query.
 * 
 * @param projectId - The unique numeric identifier of the project to fetch.
 *                    Must be a positive integer for the query to execute.
 * @param enabled - Optional flag to conditionally enable or disable the query.
 *                  When false, the query will not execute even if projectId is valid.
 *                  Useful for deferring fetch until dependencies are ready.
 * 
 * @returns {UseQueryResult<Project, AxiosError>} React Query result object containing:
 *   - data: The fetched project data, or undefined if not yet loaded or on error
 *   - isLoading: Boolean indicating if the initial fetch is in progress
 *   - isError: Boolean indicating if the request failed
 *   - error: AxiosError object with response details if the request failed
 *   - isSuccess: Boolean indicating if the request completed successfully
 *   - refetch: Function to manually trigger a refetch of the project data
 *   - isFetching: Boolean indicating if any fetch (initial or background) is in progress
 *   - dataUpdatedAt: Timestamp of when the data was last successfully fetched
 * 
 * @example
 * // Basic usage to fetch a project
 * const { data: project, isLoading, error } = useProject(123);
 * 
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!project) return <NotFound />;
 * 
 * return <ProjectDetails project={project} />;
 * 
 * @example
 * // Conditional fetching based on route parameter
 * const { projectId } = useParams<{ projectId: string }>();
 * const { data: project } = useProject(Number(projectId), !!projectId);
 * 
 * @example
 * // Manual refetch after related mutation
 * const { data: project, refetch } = useProject(123);
 * const updateMutation = useUpdateProject();
 * 
 * const handleSave = async (data: ProjectUpdateData) => {
 *   await updateMutation.mutateAsync({ projectId: 123, data });
 *   await refetch(); // Ensure latest data after update
 * };
 * 
 * @remarks
 * - Query key is ['project', projectId] for isolated cache per project ID
 * - staleTime: 2 minutes - data considered fresh for 120 seconds before background refetch
 * - gcTime: 5 minutes - unused project data retained in cache for 300 seconds
 * - enabled flag prevents fetch when projectId is 0, negative, or explicitly disabled
 * - Query function validates projectId before calling API to fail fast on invalid input
 * - Errors are AxiosError objects; access error.response?.data for API error details
 * - Successful responses are cached and served instantly on subsequent mounts within staleTime
 * 
 * @caching
 * - Cache is invalidated automatically when useUpdateProject or useDeleteProject succeed
 * - Manual invalidation possible via queryClient.invalidateQueries({ queryKey: ['project', id] })
 * - Background refetch occurs on window focus or reconnect if data is stale
 * 
 * @errorHandling
 * - Network errors: error.request property contains the failed request details
 * - HTTP errors (4xx/5xx): error.response property contains status and response data
 * - Validation errors: error.message contains descriptive failure reason
 * - Parent components should display appropriate UI based on isError and error properties
 * 
 * @see {@link projectService.getProjectById} For the underlying API service call
 * @see {@link https://tanstack.com/query/latest/docs/reference/useQuery} For React Query useQuery documentation
 * @see {@link Project} For the project data structure returned on success
 */
export const useProject = (projectId: number, enabled: boolean = true) => {
  return useQuery<Project, AxiosError>({
    /**
     * Unique query key for cache identification and invalidation.
     * 
     * @remarks
     * - Array format allows React Query to distinguish queries by projectId
     * - Enables targeted cache invalidation: ['project', 123] vs ['project', 456]
     * - Used by onSuccess handlers in mutation hooks to invalidate related caches
     */
    queryKey: ['project', projectId],
    
    /**
     * Async function that executes the API request to fetch project data.
     * 
     * @returns {Promise<Project>} Resolves to the fetched project object
     * @throws {Error} If projectId is falsy or zero
     * @throws {AxiosError} If the API request fails (network or HTTP error)
     * 
     * @remarks
     * - Validates projectId before making network call to fail fast
     * - Delegates actual HTTP request to projectService.getProjectById
     * - Errors propagate to React Query error handling via Promise rejection
     */
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      return await projectService.getProjectById(projectId);
    },
    
    /**
     * Condition to enable or disable query execution.
     * 
     * @remarks
     * - Query only runs when enabled is true AND projectId is positive
     * - Prevents unnecessary API calls when route parameters are not yet resolved
     * - Allows parent components to defer fetching until dependencies are ready
     * 
     * @default true (when projectId > 0)
     */
    enabled: enabled && projectId > 0,
    
    /**
     * Duration in milliseconds that fetched data is considered fresh.
     * 
     * @remarks
     * - After 2 minutes, data becomes stale and may refetch on mount or window focus
     * - Stale data is still displayed immediately while background refetch occurs
     * - Balances data freshness with reduced network requests for rarely-changing project data
     * 
     * @default 120000 (2 minutes)
     */
    staleTime: 2 * 60 * 1000,
    
    /**
     * Duration in milliseconds that inactive queries remain in cache.
     * 
     * @remarks
     * - After 5 minutes of not being observed by any component, cache is garbage collected
     * - Prevents memory leaks from accumulating unused project data
     * - React Query v4+ uses gcTime; v3 used cacheTime with same behavior
     * 
     * @default 300000 (5 minutes)
     */
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * React Query mutation hook for updating an existing project.
 * 
 * This hook manages the asynchronous update of project data via the API,
 * including optimistic UI patterns, error handling, and automatic cache
 * invalidation to keep related queries synchronized.
 * 
 * @returns {UseMutationResult<Project, AxiosError, { projectId: number; data: ProjectUpdateData }, unknown>}
 *   Mutation object containing:
 *   - mutate: Function to trigger update with callback-based error handling
 *   - mutateAsync: Function to trigger update with Promise-based error handling (recommended)
 *   - isPending: Boolean indicating if mutation is currently executing
 *   - isError: Boolean indicating if the last mutation attempt failed
 *   - error: AxiosError object with response details if the last attempt failed
 *   - isSuccess: Boolean indicating if the last mutation completed successfully
 *   - data: The updated project object returned from the API on success
 *   - reset: Function to reset mutation state to initial values
 * 
 * @example
 * // Basic usage with async/await error handling
 * const updateMutation = useUpdateProject();
 * 
 * const handleSave = async (projectId: number, data: ProjectUpdateData) => {
 *   try {
 *     const updated = await updateMutation.mutateAsync({ projectId, data });
 *     toast.success('Project updated successfully');
 *     navigate('/projects');
 *   } catch (error: AxiosError) {
 *     toast.error(error.response?.data?.message || 'Update failed');
 *   }
 * };
 * 
 * @example
 * // Usage with optimistic UI update pattern
 * const queryClient = useQueryClient();
 * const updateMutation = useUpdateProject();
 * 
 * const handleOptimisticUpdate = (projectId: number, data: ProjectUpdateData) => {
 *   // Cancel any outgoing refetches to avoid overwriting optimistic update
 *   queryClient.cancelQueries({ queryKey: ['project', projectId] });
 *   
 *   // Snapshot the previous value
 *   const previousProject = queryClient.getQueryData(['project', projectId]);
 *   
 *   // Optimistically update to the new value
 *   queryClient.setQueryData(['project', projectId], (old: Project) => ({
 *     ...old,
 *     ...data,
 *   }));
 *   
 *   // Execute the mutation
 *   updateMutation.mutate({ projectId, data }, {
 *     onError: (err, newProject, context) => {
 *       // Rollback to previous value on error
 *       queryClient.setQueryData(['project', projectId], previousProject);
 *       toast.error('Failed to update project');
 *     },
 *     onSettled: () => {
 *       // Always refetch after error or success to ensure server state is correct
 *       queryClient.invalidateQueries({ queryKey: ['project', projectId] });
 *     },
 *   });
 * };
 * 
 * @remarks
 * - Mutation function delegates to projectService.updateProject for API call
 * - onSuccess handler invalidates both individual project cache and projects list cache
 * - Cache invalidation triggers background refetches to synchronize UI with server state
 * - isPending flag useful for disabling form inputs and showing loading indicators
 * - Errors are AxiosError objects; access error.response?.data for API validation errors
 * 
 * @cacheInvalidation
 * - On success, invalidates ['project', variables.projectId] to refetch updated project
 * - Also invalidates ['projects'] to refresh list views that may display the updated project
 * - Invalidation triggers background refetches; stale data remains visible during refetch
 * - Consider using queryClient.setQueryData for immediate UI updates if refetch latency is noticeable
 * 
 * @errorHandling
 * - HTTP 400/422: Validation errors; error.response?.data contains field-specific messages
 * - HTTP 404: Project not found; may indicate concurrent deletion or invalid ID
 * - HTTP 403/401: Authorization errors; user lacks permission to update this project
 * - Network errors: error.request property contains failed request details
 * - Parent components should display field-level errors for validation failures
 * 
 * @performance
 * - Mutation executes immediately; no debouncing or throttling applied
 * - Consider debouncing rapid form changes before triggering mutation for better UX
 * - Cache invalidation may trigger multiple refetches; monitor network usage in dev tools
 * 
 * @see {@link projectService.updateProject} For the underlying API service call
 * @see {@link ProjectUpdateData} For the structure of update payload
 * @see {@link https://tanstack.com/query/latest/docs/reference/useMutation} For React Query useMutation documentation
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * Async function that executes the API request to update project data.
     * 
     * @param variables - Object containing projectId and update payload
     * @param {number} variables.projectId - The unique identifier of the project to update
     * @param {ProjectUpdateData} variables.data - Partial project data with fields to update
     * @returns {Promise<Project>} Resolves to the updated project object from API
     * @throws {AxiosError} If the API request fails (validation, auth, or network error)
     * 
     * @remarks
     * - Delegates actual HTTP PUT request to projectService.updateProject
     * - Only fields included in data are sent to API (partial update pattern)
     * - API returns the complete updated project object for cache synchronization
     * - Errors propagate to React Query error handling via Promise rejection
     */
    mutationFn: async ({ projectId, data }: { projectId: number; data: ProjectUpdateData }) => {
      return await projectService.updateProject(projectId, data);
    },
    
    /**
     * Callback executed when mutation completes successfully.
     * 
     * @param {Project} data - The updated project object returned from API
     * @param {Object} variables - The variables that were passed to mutate/mutateAsync
     * @param {number} variables.projectId - The ID of the project that was updated
     * @param {ProjectUpdateData} variables.data - The update payload that was sent to API
     * 
     * @remarks
     * - Invalidates individual project cache to ensure fresh data on next access
     * - Invalidates projects list cache to reflect changes in list views
     * - Invalidation triggers background refetches; stale data remains visible during fetch
     * - Parent components can add additional onSuccess logic via mutation options
     * 
     * @example
     * // Extend onSuccess with custom navigation or notifications
     * useUpdateProject({
     *   onSuccess: (data, variables) => {
     *     // Call default invalidation logic
     *     // Then add custom behavior
     *     toast.success(`${variables.data.projectname} updated`);
     *     analytics.track('project_updated', { projectId: variables.projectId });
     *   }
     * });
     */
    onSuccess: (_data, variables) => {
      // Invalidate cache for the individual project to ensure fresh data on next access
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      
      // Invalidate cache for the projects list to reflect changes in list views
      // This ensures updated project appears with new data in grids/tables
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

/**
 * React Query mutation hook for deleting a project.
 * 
 * This hook manages the asynchronous deletion of a project via the API,
 * including confirmation patterns, error handling, and automatic cache
 * invalidation to remove the deleted project from related queries.
 * 
 * @returns {UseMutationResult<void, AxiosError, number, unknown>}
 *   Mutation object containing:
 *   - mutate: Function to trigger deletion with callback-based error handling
 *   - mutateAsync: Function to trigger deletion with Promise-based error handling (recommended)
 *   - isPending: Boolean indicating if mutation is currently executing
 *   - isError: Boolean indicating if the last mutation attempt failed
 *   - error: AxiosError object with response details if the last attempt failed
 *   - isSuccess: Boolean indicating if the last mutation completed successfully
 *   - reset: Function to reset mutation state to initial values
 * 
 * @example
 * // Basic usage with confirmation and async error handling
 * const deleteMutation = useDeleteProject();
 * 
 * const handleDelete = async (projectId: number, projectName: string) => {
 *   const confirmed = await showConfirm({
 *     title: 'Delete project?',
 *     description: `Are you sure you want to delete "${projectName}"? This cannot be undone.`,
 *     confirmLabel: 'Delete',
 *     cancelLabel: 'Cancel'
 *   });
 *   
 *   if (!confirmed) return;
 *   
 *   try {
 *     await deleteMutation.mutateAsync(projectId);
 *     toast.success('Project deleted successfully');
 *     navigate('/projects'); // Navigate away from deleted resource
 *   } catch (error: AxiosError) {
 *     toast.error(error.response?.data?.message || 'Delete failed');
 *   }
 * };
 * 
 * @example
 * // Usage with optimistic removal from list cache
 * const queryClient = useQueryClient();
 * const deleteMutation = useDeleteProject();
 * 
 * const handleOptimisticDelete = (projectId: number) => {
 *   // Cancel any outgoing refetches for the projects list
 *   queryClient.cancelQueries({ queryKey: ['projects'] });
 *   
 *   // Snapshot the previous list value
 *   const previousProjects = queryClient.getQueryData(['projects']);
 *   
 *   // Optimistically remove the project from the list cache
 *   queryClient.setQueryData(['projects'], (old: ProjectResponse) => ({
 *     ...old,
 *     data: old?.data?.filter(p => p.projectid !== projectId)
 *   }));
 *   
 *   // Execute the mutation
 *   deleteMutation.mutate(projectId, {
 *     onError: (err, deletedId, context) => {
 *       // Rollback to previous list on error
 *       queryClient.setQueryData(['projects'], previousProjects);
 *       toast.error('Failed to delete project');
 *     },
 *     onSettled: () => {
 *       // Always refetch to ensure server state is correct
 *       queryClient.invalidateQueries({ queryKey: ['projects'] });
 *     },
 *   });
 * };
 * 
 * @remarks
 * - Mutation function delegates to projectService.deleteProject for API call
 * - onSuccess handler invalidates projects list cache to remove deleted item from UI
 * - Does not invalidate individual project cache since resource no longer exists
 * - isPending flag useful for disabling delete buttons and showing loading indicators
 * - Errors are AxiosError objects; access error.response?.data for API error details
 * 
 * @cacheInvalidation
 * - On success, invalidates ['projects'] to refetch and remove deleted project from lists
 * - Individual project cache ['project', id] is not invalidated; it will naturally expire via gcTime
 * - Invalidation triggers background refetches; stale list data remains visible during refetch
 * - Consider using queryClient.setQueryData for immediate list update if refetch latency is noticeable
 * 
 * @errorHandling
 * - HTTP 404: Project not found; may indicate already deleted or invalid ID
 * - HTTP 403/401: Authorization errors; user lacks permission to delete this project
 * - HTTP 409: Conflict; project may have dependent resources preventing deletion
 * - Network errors: error.request property contains failed request details
 * - Parent components should display user-friendly error messages based on status code
 * 
 * @security
 * - Deletion is a destructive operation; always require explicit user confirmation
 * - Consider implementing soft delete (status flag) instead of hard delete for auditability
 * - Ensure backend validates user permissions before processing delete request
 * - Log deletion events for security auditing and compliance requirements
 * 
 * @performance
 * - Mutation executes immediately; no debouncing applicable for delete actions
 * - Cache invalidation may trigger list refetch; monitor network usage in dev tools
 * - For large lists, consider pagination-aware invalidation to avoid refetching all pages
 * 
 * @see {@link projectService.deleteProject} For the underlying API service call
 * @see {@link https://tanstack.com/query/latest/docs/reference/useMutation} For React Query useMutation documentation
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * Async function that executes the API request to delete a project.
     * 
     * @param {number} projectId - The unique identifier of the project to delete
     * @returns {Promise<void>} Resolves when deletion is confirmed by API
     * @throws {AxiosError} If the API request fails (auth, not found, or network error)
     * 
     * @remarks
     * - Delegates actual HTTP DELETE request to projectService.deleteProject
     * - API returns void/no content on success; no project object to cache
     * - Errors propagate to React Query error handling via Promise rejection
     * - Deletion is permanent; ensure user confirmation before calling this function
     */
    mutationFn: async (projectId: number) => {
      return await projectService.deleteProject(projectId);
    },
    
    /**
     * Callback executed when mutation completes successfully.
     * 
     * @remarks
     * - Invalidates projects list cache to trigger refetch and remove deleted item
     * - Does not invalidate individual project cache since resource no longer exists
     * - Parent components can add additional onSuccess logic via mutation options
     * - Typical pattern: show success toast and navigate away from deleted resource
     * 
     * @example
     * // Extend onSuccess with custom navigation or analytics
     * useDeleteProject({
     *   onSuccess: (data, projectId) => {
     *     // Call default invalidation logic
     *     // Then add custom behavior
     *     toast.success('Project deleted');
     *     analytics.track('project_deleted', { projectId });
     *     navigate('/projects'); // Navigate to list after deletion
     *   }
     * });
     */
    onSuccess: () => {
      // Invalidate cache for the projects list to refetch and remove deleted project
      // This ensures deleted project no longer appears in grids, tables, or dropdowns
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};