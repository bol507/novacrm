import { Button } from "@/components/ui/button";
import { Folder, Loader2, Pencil, Trash2 } from "lucide-react";

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
  isDeleting 
}: QuoteMainActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8">
      <Button
        variant="outline"
        className="flex-1 gap-2 text-lg py-6"
        onClick={onCreateProject}
      >
        <Folder className="h-6 w-6" />
        Create Project
      </Button>
      <Button
        className="flex-1 gap-2 text-lg py-6"
        onClick={onEdit}
      >
        <Pencil className="h-6 w-6" />
        Edit Quote
      </Button>
      <Button
        variant="destructive"
        className="flex-1 gap-2 text-lg py-6"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Trash2 className="h-6 w-6" />
        )}
        Delete
      </Button>
    </div>
  );
};