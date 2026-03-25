import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ProjectProgress } from "./ProjectProgress";
import { useConfirm } from "@/components/confirm-dialog";
import type { Project } from "../types/projects";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { Eye, Trash2 } from "lucide-react";

/**
 * Props for ProjectCard component
 */
export interface ProjectCardProps {
  /** Project object containing all project data to display */
  project: Project;
  /** Optional callback fired when view details action is triggered */
  onView?: (project: Project) => void;
  /** Optional callback fired when edit action is triggered */
  onEdit?: (project: Project) => void;
  /** Optional callback fired when delete action is confirmed */
  onDelete?: (project: Project) => void;
}

/**
 * ProjectCard Component
 * 
 * Displays a summary card for a single project with key information:
 * - Project name, status badge, priority badge, and due date badge
 * - Progress bar with task completion metrics
 * - Task counts and hits statistics
 * - Client name and important dates (start, target end)
 * - Assigned user avatar and name
 * - Target budget display
 * - View details and delete actions
 * 
 * @component
 * @param {ProjectCardProps} props - Component props
 * @param {Project} props.project - Project data to display
 * @param {function} [props.onView] - View details action callback
 * @param {function} [props.onEdit] - Edit action callback (reserved for future use)
 * @param {function} [props.onDelete] - Delete action callback with confirmation
 * 
 * @returns {JSX.Element} Project summary card with interactive actions
 * 
 * @example
 * // Basic usage with project data
 * <ProjectCard project={project} />
 * 
 * @example
 * // With action handlers
 * <ProjectCard 
 *   project={project}
 *   onView={(p) => navigate(`/projects/${p.projectid}`)}
 *   onEdit={(p) => navigate(`/projects/${p.projectid}/edit`)}
 *   onDelete={(p) => refetchProjects()}
 * />
 * 
 * @remarks
 * - Card has left border accent color indicating primary status
 * - Hover effect adds subtle shadow for interactivity feedback
 * - View button navigates to project details page
 * - Delete button uses confirmation dialog to prevent accidental deletion
 * - Assigned user display handles special case: ID=2 represents "All users"
 * - Date formatting uses Panama locale (es-PA) for consistency
 * - Budget display formats USD values with thousands separators
 * - Text truncation (line-clamp) prevents layout overflow with long values
 * - Component is purely presentational; all business logic handled by parent
 * 
 * @see {@link ProjectStatusBadge} for status display component
 * @see {@link ProjectProgress} for progress bar component
 * @see {@link useConfirm} for confirmation dialog hook
 */
export const ProjectCard = ({ 
  project, 
  onView,  
  onDelete 
}: ProjectCardProps) => {
  /**
   * Mutation hook for deleting project via API
   */
  const deleteProjectMutation = useDeleteProject();
  
  /**
   * Confirmation dialog hook for destructive actions
   */
  const showConfirm = useConfirm();

  /**
   * Determine if project is assigned to "All users" (special ID=2 case)
   * This is a business rule specific to the CRM system
   */
  const isAssignedToAll = project.assigned_user_id === 2;

  /**
   * Format assigned user name for display
   * Handles special case and fallback for missing data
   */
  const assignedUserName = isAssignedToAll
    ? "All users"
    : project.assigned_user_name || "Unassigned";

  /**
   * Generate avatar fallback text from assigned user name
   * Uses first character uppercase for visual consistency
   */
  const avatarFallback = isAssignedToAll
    ? "T"
    : (project.assigned_user_name || "?").charAt(0).toUpperCase();

  /**
   * Handles view details button click
   * 
   * @param e - Mouse event from button click
   */
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(project);
  };

  /**
   * Handles delete button click with confirmation dialog
   * 
   * @param e - Mouse event from button click
   * 
   * @remarks
   * - Stops event propagation to prevent card click navigation
   * - Shows confirmation dialog with project name for clarity
   * - Calls delete mutation on user confirmation
   * - Logs errors to console for debugging (toast handled by mutation)
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    showConfirm({
      title: "Delete project?",
      description: `Are you sure you want to delete the project "${project.projectname}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteProjectMutation.mutateAsync(project.projectid);
          onDelete?.(project);
        } catch (error: any) {
          console.error("Error deleting project:", error);
        }
      }
    });
  };

  return (
    <Card 
      className="flex flex-col h-full border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView?.(project)}
    >
      {/* Card Header: Title, badges, and actions */}
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          {/* Project name with truncation for long titles */}
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {project.projectname}
          </CardTitle>
          
          {/* Badges row: status, priority, due date */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <ProjectStatusBadge status={project.projectstatus || "in progress"} />
            
            {/* Priority badge (conditional) */}
            {project.projectpriority && (
              <Badge variant="outline" className="text-xs">
                {project.projectpriority}
              </Badge>
            )}
            
            {/* Due date badge (conditional, yellow warning style) */}
            {project.targetenddate && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Due: {new Date(project.targetenddate).toLocaleDateString("es-PA")}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Action buttons: View details and Delete */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* View details button */}
          {onView && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleViewClick}
              className="h-8 w-8"
              aria-label="View project details"
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          {/* Delete button (only if onDelete is provided) */}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteClick}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete project"
              title="Eliminar proyecto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Card Content: Progress, metrics, client, dates */}
      <CardContent className="flex-1">
        <div className="space-y-4">
          {/* Progress bar with task completion metrics */}
          <ProjectProgress
            progress={project.progress || "0"}
            totalTasks={project.totalTasks || 0}
            completedTasks={project.completedTasks || 0}
          />

          {/* Metrics grid: Tasks completed/total and hits count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tasks</p>
              <p className="font-medium">
                {project.completedTasks || 0} / {project.totalTasks || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hits</p>
              <p className="font-medium">{project.hits || 0} hits</p>
            </div>
          </div>

          {/* Client information section */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium line-clamp-1">
              {project.account_name || "No client"}
            </p>
          </div>

          {/* Start date section */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Start date</p>
            <p className="font-medium">
              {project.startdate
                ? new Date(project.startdate).toLocaleDateString("es-PA")
                : "-"
              }
            </p>
          </div>

          {/* Target end date section (conditional) */}
          {project.targetenddate && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Due date</p>
              <p className="font-medium text-orange-600">
                {new Date(project.targetenddate).toLocaleDateString("es-PA")}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Card Footer: Assigned user and budget */}
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        {/* Assigned user display with avatar fallback */}
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
            aria-label={`Assigned to: ${assignedUserName}`}
          >
            {avatarFallback}
          </div>
          <span className="text-sm line-clamp-1">{assignedUserName}</span>
        </div>
        
        {/* Target budget display with USD formatting */}
        <div className="font-bold text-lg">
          ${project.targetbudget
            ? parseInt(project.targetbudget).toLocaleString("es-PA")
            : "0"}
        </div>
      </CardFooter>
    </Card>
  );
};