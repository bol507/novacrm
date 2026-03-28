import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

/**
 * Props for ContactFormActions component
 */
export interface ContactFormActionsProps {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Form mode for button text */
  mode: 'create' | 'edit';
  /** Callback when cancel is clicked */
  onCancel: () => void;
}

/**
 * ContactFormActions Component
 *
 * Displays the form action buttons: Cancel and Submit.
 * Submit button shows loading state during submission.
 *
 * @component
 * @param props - Component props
 * @param props.isSubmitting - Whether form is currently submitting
 * @param props.mode - Form mode ('create' or 'edit')
 * @param props.onCancel - Callback when cancel is clicked
 * @returns The rendered form action buttons
 *
 * @example
 * // Create mode
 * <ContactFormActions
 *   isSubmitting={isSubmitting}
 *   mode="create"
 *   onCancel={handleCancel}
 * />
 *
 * @example
 * // Edit mode with loading state
 * <ContactFormActions
 *   isSubmitting={true}
 *   mode="edit"
 *   onCancel={handleCancel}
 * />
 */
export const ContactFormActions = ({ isSubmitting, mode, onCancel }: ContactFormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="h-4 w-4 animate-spin" />
            {mode === 'edit' ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          mode === 'edit' ? 'Update Contact' : 'Create Contact'
        )}
      </Button>
    </div>
  );
};