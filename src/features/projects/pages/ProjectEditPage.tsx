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
 */
export const ProjectEditPage = () => {

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {  data: project, isLoading: isLoadingProject, error } = useProject(
    Number(projectId),
    !!projectId
  );
  const updateProjectMutation = useUpdateProject();

  
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

  
  const handleCancel = () => {
    navigate('/dashboard/projects');
  };

  
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