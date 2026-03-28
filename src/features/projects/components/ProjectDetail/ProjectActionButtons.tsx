import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import type { Project } from '../../types/projects';

/**
 * Props for ProjectActionButtons component
 */
export interface ProjectActionButtonsProps {
  /** Project object for actions */
  project: Project;
  /** Callback for edit action */
  onEdit: () => void;
  /** Callback for delete action (with confirmation) */
  onDelete: () => void;
  /** Callback for complete action (with confirmation) */
  onComplete: () => void;
  /** Whether delete operation is in progress */
  isDeleting: boolean;
  /** Whether update operation is in progress */
  isUpdating: boolean;
}

/**
 * ProjectActionButtons Component
 * 
 * Displays sticky action buttons: Edit, Delete, and Mark as Complete.
 * Buttons are responsive (stack on mobile, row on desktop).
 * 
 * @component
 * @param {ProjectActionButtonsProps} props - Component props
 * @param {Project} props.project - Project object
 * @param {function} props.onEdit - Edit callback
 * @param {function} props.onDelete - Delete callback
 * @param {function} props.onComplete - Complete callback
 * @param {boolean} props.isDeleting - Delete loading state
 * @param {boolean} props.isUpdating - Update loading state
 * 
 * @returns {JSX.Element} Action buttons section
 */
export const ProjectActionButtons = ({
  project,
  onEdit,
  onDelete,
  onComplete,
  isDeleting,
  isUpdating,
}: ProjectActionButtonsProps) => {
  const isLoading = isDeleting || isUpdating;
  const isCompleted = project.projectstatus?.toLowerCase() === 'completed';

  return (
    <div className="sticky bottom-6 bg-background/80 backdrop-blur-sm py-4 border-t border-border">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="flex-1 gap-2 py-6 text-lg"
          onClick={onEdit}
          disabled={isLoading}
        >
          <Pencil className="h-6 w-6" />
          Edit project
        </Button>
        <Button
          variant="destructive"
          className="flex-1 gap-2 py-6 text-lg"
          onClick={onDelete}
          disabled={isLoading}
        >
          <Trash2 className="h-6 w-6" />
          Delete
        </Button>
        {!isCompleted && (
          <Button
            variant="outline"
            className="flex-1 gap-2 py-6 text-lg"
            onClick={onComplete}
            disabled={isLoading}
          >
            <CheckCircle className="h-6 w-6" />
            Mark as completed
          </Button>
        )}
      </div>
    </div>
  );
};