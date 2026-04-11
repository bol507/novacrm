import { Button } from "@/components/ui/button";
import { CopyIcon, Folder, Loader2, Pencil, Trash2 } from "lucide-react";

/**
 * Props for QuoteMainActions component
 */
export interface QuoteMainActionsProps {
 
  
  /** Callback for creating project from quote */
  onCreateProject: () => void;
  /** Callback for editing quote */
  onEdit: () => void;
  /** Callback for deleting quote (triggers confirmation) */
  onDelete: () => void;
  /** Loading state for delete operation */
  isDeleting: boolean;
  /** Callback for duplicating quote */
  onDuplicate?: () => void;
  /** Loading state for duplicate operation */
  isDuplicating?: boolean;
}

/**
 * QuoteMainActions Component
 * 
 * Displays primary action buttons: Create Project, Edit Quote, Delete Quote.
 * Buttons are responsive (stack on mobile, row on desktop) with consistent styling.
 * 
 * @component
 * @param {QuoteMainActionsProps} props - Component props
 * @param {function} props.onCreateProject - Create project callback
 * @param {function} props.onEdit - Edit quote callback
 * @param {function} props.onDelete - Delete quote callback (with confirmation)
 * @param {boolean} props.isDeleting - Delete operation loading state
 * 
 * @returns {JSX.Element} Main action buttons section
 * 
 * @example
 * <QuoteMainActions 
 *   onCreateProject={() => setIsCreateProjectOpen(true)}
 *   onEdit={() => handleEditQuote(quote)}
 *   onDelete={() => handleDeleteClick(quote)}
 *   isDeleting={isDeleting}
 * />
 */
export const QuoteMainActions = ({ 

  onCreateProject, 
  onEdit, 
  onDelete, 
  isDeleting,
  onDuplicate, 
  isDuplicating = false,
}: QuoteMainActionsProps) => {
  return (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
    {/* Create Project */}
    <Button
      variant="outline"
      className="gap-2 text-base sm:text-lg py-4 sm:py-6 h-auto justify-center"
      onClick={onCreateProject}
    >
      <Folder className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden sm:inline">Create Project</span>
      <span className="sm:hidden">Project</span>
    </Button>

    {/* Edit Quote */}
    <Button
      variant="outline"
      className="gap-2 text-base sm:text-lg py-4 sm:py-6 h-auto justify-center"
      onClick={onEdit}
    >
      <Pencil className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden sm:inline">Edit Quote</span>
      <span className="sm:hidden">Edit</span>
    </Button>

    {/* Duplicate Quote */}
    {onDuplicate ? (
      <Button
        variant="outline"
        className="gap-2 text-base sm:text-lg py-4 sm:py-6 h-auto justify-center"
        onClick={onDuplicate}
        disabled={isDuplicating}
      >
        {isDuplicating ? (
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
        ) : (
          <CopyIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
        <span className="hidden sm:inline">Duplicate</span>
        <span className="sm:hidden">Copy</span>
      </Button>
    ) : (
      /* Spacer para mantener grid consistente si no hay Duplicate */
      <div className="hidden sm:block" />
    )}

    {/* Delete Quote */}
    <Button
      variant="destructive"
      className="gap-2 text-base sm:text-lg py-4 sm:py-6 h-auto justify-center"
      onClick={onDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
      ) : (
        <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
      <span className="hidden sm:inline">Delete</span>
      <span className="sm:hidden">Del</span>
    </Button>
  </div>
);
};