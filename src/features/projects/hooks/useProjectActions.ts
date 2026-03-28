import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useConfirm } from '@/components/confirm-dialog';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { useDeleteProject } from '../hooks/useDeleteProject';
import type { Project } from '../types/projects';

/**
 * Return type for useProjectActions hook
 */
export interface ProjectActions {
  /** Navigate to project edit page */
  handleEditProject: (projectId: string) => void;
  /** Show confirmation and delete project */
  handleDeleteClick: (project: Project) => void;
  /** Show confirmation and mark project as completed */
  handleCompleteProject: (project: Project, refetch: () => void) => void;
  /** Loading states */
  isDeleting: boolean;
  isUpdating: boolean;
}

/**
 * Custom hook for project action handlers
 * 
 * @param projectId - Current project ID from route params
 * @param refetch - Function to refetch project data after mutations
 * @returns Object with action handlers and loading states
 * 
 * @example
 * const { handleEditProject, handleDeleteClick, isDeleting } = useProjectActions(projectId, refetch);
 */
export const useProjectActions = (
  projectId: string | undefined
): ProjectActions => {
  const navigate = useNavigate();
  const showConfirm = useConfirm();
  
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  /**
   * Navigate to project edit page
   * 
   * @param id - Project ID from route params
   */
  const handleEditProject = (id: string) => {
    navigate(`/dashboard/projects/${id}/edit`);
  };

  /**
   * Delete project after confirmation
   * 
   * @param project - Project object to delete
   */
  const handleDeleteClick = (project: Project) => {
    showConfirm({
      title: 'Delete project?',
      description: `Are you sure you want to delete the project "${project.projectname}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          if (!projectId) return;
          await deleteProjectMutation.mutateAsync(parseInt(projectId));
          navigate('/dashboard/projects');
          toast.success('Project deleted successfully');
        } catch (error) {
          console.error('Error deleting project:', error);
          toast.error('Error deleting project');
        }
      },
    });
  };

  /**
   * Mark project as completed after confirmation
   * 
   * @param project - Project object to update
   * @param refetch - Function to refetch data after successful update
   */
  const handleCompleteProject = (project: Project, refetch: () => void) => {
    if (!projectId) return;

    showConfirm({
      title: 'Mark as completed?',
      description: `Are you sure you want to mark the project "${project.projectname}" as completed?`,
      confirmLabel: 'Complete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await updateProjectMutation.mutateAsync({
            projectId: parseInt(projectId),
            data: {
              projectstatus: 'completed',
              actualenddate: new Date().toISOString().split('T')[0],
              progress: '100',
            }
          });
          toast.success('Project marked as completed');
          refetch();
        } catch (error) {
          console.error('Error completing project:', error);
          toast.error('Error completing project');
        }
      },
    });
  };

  return {
    handleEditProject,
    handleDeleteClick,
    handleCompleteProject,
    isDeleting: deleteProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
  };
};