import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject, useUpdateProject } from '../hooks/useProject';
import { ProjectForm } from '../components/ProjectForm';
import type { FormData } from '../types/projects';

/**
 * ProjectEditPage Component
 * 
 * A page component for editing an existing project.
 * 
 * This component handles:
 * - Fetching project data by ID from the API via React Query
 * - Rendering a pre-filled form with project details
 * - Handling form submission with validation and error handling
 * - Managing navigation back to the projects list
 * - Displaying loading and error states with appropriate UI feedback
 * 
 * The component follows a container pattern where data fetching and
 * business logic are handled locally, while the UI is delegated to
 * the presentational ProjectForm component.
 * 
 * @component
 * @returns {JSX.Element} The rendered project edit page with form and navigation
 * 
 * @example
 * // Usage in router configuration
 * <Route path="/dashboard/projects/:projectId/edit" element={<ProjectEditPage />} />
 * 
 * @example
 * // Navigation to this page from project list
 * navigate(`/dashboard/projects/${project.projectid}/edit`);
 * 
 * @remarks
 * - Uses React Router hooks (useParams, useNavigate) for routing
 * - Uses React Query hooks (useProject, useUpdateProject) for data management
 * - Uses sonner toast library for user feedback notifications
 * - Displays skeleton loading state while fetching project data
 * - Displays error card with retry option if project fetch fails
 * - Form submission includes error handling with user-friendly messages
 * - Navigation paths are hardcoded to '/dashboard/projects' for consistency
 * - Component assumes projectId is a valid number; invalid IDs show error state
 * 
 * @see {@link useProject} For fetching project data by ID
 * @see {@link useUpdateProject} For updating project via API mutation
 * @see {@link ProjectForm} For the reusable form component UI
 * @see {@link toast} For user notification handling
 */
export const ProjectEditPage = () => {
  /**
   * Route parameter containing the project ID to edit.
   * Extracted from URL pattern /dashboard/projects/:projectId/edit
   */
  const { projectId } = useParams<{ projectId: string }>();
  
  /**
   * Navigation function for programmatic routing.
   * Used for redirecting after successful update or cancellation.
   */
  const navigate = useNavigate();
  
  /**
   * React Query hook for fetching project data.
   * 
   * @returns {Object} Query result containing:
   *   -  The fetched project data or undefined
   *   - isLoading: Boolean indicating fetch in progress
   *   - error: Error object if fetch failed
   */
  const {  data: project, isLoading: isLoadingProject, error } = useProject(
    Number(projectId),
    !!projectId
  );
  
  /**
   * React Query mutation hook for updating project data.
   * 
   * @returns {Object} Mutation object containing:
   *   - mutateAsync: Function to trigger update with promise return
   *   - isPending: Boolean indicating mutation in progress
   *   - isError: Boolean indicating mutation failed
   */
  const updateProjectMutation = useUpdateProject();

  /**
   * Handles form submission for updating project data.
   * 
   * Validates projectId, triggers update mutation, and handles
   * success/error states with user feedback and navigation.
   * 
   * @param {FormData} data - The form data object containing updated project fields
   * @returns {Promise<void>} Resolves when submission handling is complete
   * 
   * @remarks
   * - Shows error toast if projectId is missing or invalid
   * - Shows success toast and navigates to projects list on success
   * - Shows error toast with API error message or fallback text on failure
   * - Uses mutateAsync for promise-based error handling with try/catch
   * 
   * @example
   * // Form data structure passed to handler
   * handleSubmit({
   *   projectname: 'Kitchen Renovation',
   *   projectstatus: 'in progress',
   *   targetenddate: '2026-06-30',
   *   // ... other fields
   * });
   */
  const handleSubmit = async (data: FormData) => {
    if (!projectId) {
      toast.error('Invalid project ID');
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({
        projectId: Number(projectId),
        data,
      });
      
      toast.success('Project updated successfully');
      navigate('/dashboard/projects');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Error updating project'
      );
    }
  };

  /**
   * Handles cancellation of edit operation.
   * 
   * Navigates user back to the projects list without saving changes.
   * Any unsaved form data is discarded.
   * 
   * @returns {void}
   * 
   * @remarks
   * - No confirmation dialog is shown; changes are discarded immediately
   * - Navigation target is hardcoded to '/dashboard/projects'
   * - Consider adding unsaved changes warning for future enhancement
   */
  const handleCancel = () => {
    navigate('/dashboard/projects');
  };

  /**
   * Renders loading state with skeleton UI.
   * 
   * Displays animated placeholder blocks while project data is being fetched.
   * Prevents form rendering with incomplete data.
   * 
   * @returns {JSX.Element} Skeleton loading interface
   */
  if (isLoadingProject) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  /**
   * Renders error state when project fetch fails.
   * 
   * Displays error message with navigation option to return to projects list.
   * Handles both React Query errors and missing project data.
   * 
   * @returns {JSX.Element} Error card with retry navigation
   */
  if (error || !project) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Project not found'}
            </p>
            <Button variant="outline" onClick={() => navigate('/dashboard/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Renders the main edit page UI with header and form.
   * 
   * @returns {JSX.Element} Complete project edit interface
   * 
   * @structure
   * - Header section with back navigation and project title
   * - ProjectForm component pre-filled with project data
   * - Form configured in edit mode with submit/cancel handlers
   * - Loading state passed to form for submit button feedback
   */
  return (
    <div className="p-6 space-y-6">
      {/* Header section with back navigation and project identifier */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/projects')}
          className="h-10 w-10"
          aria-label="Back to projects list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Edit Project
          </h1>
          <p className="text-muted-foreground">
            {project.projectname} ({project.project_no})
          </p>
        </div>
      </div>

      {/* Project form component with edit mode configuration */}
      <ProjectForm
        project={project}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateProjectMutation.isPending}
      />
    </div>
  );
};

export default ProjectEditPage;