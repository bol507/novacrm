import { Button } from "@/components/ui/button";
import { CopyIcon, Folder, Loader2, Pencil, Trash2 } from "lucide-react";

export interface QuoteMainActionsProps {
  /** Callback for creating project from quote */
  onCreateProject: () => void;
  /** Callback for editing quote */
  onEdit: () => void;
  /** Callback for deleting quote (triggers confirmation) */
  onDelete: () => void;
  /** Loading state for delete operation */
  isDeleting: boolean;
  /** Callback for duplicating quote (optional) */
  onDuplicate?: () => void;
  /** Loading state for duplicate operation (optional) */
  isDuplicating?: boolean;
}

/**
 * QuoteMainActions Component
 *
 * Displays primary action buttons: Create Project, Edit Quote, Duplicate Quote, Delete Quote.
 * Buttons are responsive (stack on mobile, row on desktop) with consistent styling.
 *
 * @component
 * @param props - Component props
 * @param props.onCreateProject - Create project callback
 * @param props.onEdit - Edit quote callback
 * @param props.onDelete - Delete quote callback (with confirmation)
 * @param props.isDeleting - Delete operation loading state
 * @param props.onDuplicate - Optional duplicate quote callback
 * @param props.isDuplicating - Optional duplicate operation loading state
 * @returns The main action buttons section
 *
 * @example
 * // Basic usage
 * <QuoteMainActions
 *   onCreateProject={() => setIsCreateProjectOpen(true)}
 *   onEdit={() => handleEditQuote(quote)}
 *   onDelete={() => handleDeleteClick(quote)}
 *   isDeleting={isDeleting}
 * />
 *
 * @example
 * // With duplicate functionality
 * <QuoteMainActions
 *   onCreateProject={() => setIsCreateProjectOpen(true)}
 *   onEdit={() => handleEditQuote(quote)}
 *   onDelete={() => handleDeleteClick(quote)}
 *   isDeleting={isDeleting}
 *   onDuplicate={() => handleDuplicateQuote(quote)}
 *   isDuplicating={isDuplicating}
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
      <Button
        variant="outline"
        className="gap-2 text-base sm:text-lg py-4 sm:py-6 h-auto justify-center"
        onClick={onCreateProject}
      >
        <Folder className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="hidden sm:inline">Create Project</span>
        <span className="sm:hidden">Project</span>
      </Button>

      <Button
        variant="outline"
        className="gap-2 text-base sm:text-lg py-4 sm:py-6 h-auto justify-center"
        onClick={onEdit}
      >
        <Pencil className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="hidden sm:inline">Edit Quote</span>
        <span className="sm:hidden">Edit</span>
      </Button>

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
          <span className="sm:hidden">Duplicate</span>
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}

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