import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OpportunityForm, { 
  type OpportunityFormValues,
  type OpportunityPayload,
  opportunityFormSchema 
} from "./OpportunityForm";

/**
 * Re-export types and schema for backward compatibility
 */
export { opportunityFormSchema };
export type { OpportunityFormValues, OpportunityPayload };

/**
 * Props for OpportunityFormDialog component
 */
export interface OpportunityFormDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Callback to change dialog visibility */
  onOpenChange: (open: boolean) => void;
  /** Callback fired when form is submitted with validated data */
  onSubmit: (values: OpportunityPayload) => void;
  /** Form mode: 'create' for new opportunity, 'edit' for existing */
  mode?: 'create' | 'edit';
  /** Initial opportunity data for edit mode */
  initialData?: any;
}

/**
 * OpportunityFormDialog Component
 * 
 * A dialog wrapper for the OpportunityForm component.
 * Maintains backward compatibility for existing code that uses the Dialog pattern.
 * For new page-based implementations, use OpportunityForm directly instead.
 * 
 * @component
 * @param {OpportunityFormDialogProps} props - Component props
 * @param {boolean} props.open - Dialog visibility state
 * @param {function} props.onOpenChange - Callback to toggle dialog visibility
 * @param {function} props.onSubmit - Submit callback with validated form data
 * @param {'create' | 'edit'} [props.mode='create'] - Form mode determines title and initial data
 * @param {any} [props.initialData] - Initial opportunity data for edit mode
 * 
 * @returns {JSX.Element} Opportunity form dialog with search, validation, and submission
 * 
 * @example
 * // Create mode
 * <OpportunityFormDialog 
 *   open={isOpen} 
 *   onOpenChange={setIsOpen} 
 *   onSubmit={handleCreateOpportunity} 
 *   mode="create" 
 * />
 * 
 * @example
 * // Edit mode with existing opportunity data
 * <OpportunityFormDialog 
 *   open={isOpen} 
 *   onOpenChange={setIsOpen} 
 *   onSubmit={handleUpdateOpportunity} 
 *   mode="edit" 
 *   initialData={selectedOpportunity} 
 * />
 * 
 * @remarks
 * - This is a thin wrapper around OpportunityForm
 * - Prefer using OpportunityForm directly in page components for better UX
 * - Dialog will still work for backward compatibility
 * 
 * @see {@link OpportunityForm} for the actual form implementation
 */
const OpportunityFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData
}: OpportunityFormDialogProps) => {
  /**
   * Handle form submission within dialog context
   */
  const handleSubmit = (values: OpportunityPayload) => {
    onSubmit(values);
  };

  /**
   * Handle cancel within dialog context - closes the dialog
   */
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Opportunity' : 'New Opportunity'}
          </DialogTitle>
        </DialogHeader>

        <OpportunityForm
          mode={mode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityFormDialog;
