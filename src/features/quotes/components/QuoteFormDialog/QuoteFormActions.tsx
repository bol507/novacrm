import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Loader2Icon } from "lucide-react";

/**
 * Props for QuoteFormActions component
 */
export interface QuoteFormActionsProps {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Form mode for button text */
  mode: 'create' | 'edit';
  /** Callback when cancel is clicked */
  onCancel: () => void;
}

/**
 * QuoteFormActions Component
 *
 * Displays the form action buttons: Cancel and Submit.
 * Submit button shows loading state during submission.
 *
 * @component
 * @param props - Component props
 * @param props.isSubmitting - Form submission state
 * @param props.mode - Form mode for button text
 * @param props.onCancel - Cancel callback
 * @param props.hasErrors - Optional flag indicating whether there are validation errors
 *
 * @returns The rendered form action buttons
 *
 * @example
 * // Basic usage
 * <QuoteFormActions
 *   isSubmitting={isSubmitting}
 *   mode="create"
 *   onCancel={handleCancel}
 * />
 *
 * @example
 * // With error indicator
 * <QuoteFormActions
 *   isSubmitting={isSubmitting}
 *   mode="edit"
 *   onCancel={handleCancel}
 *   hasErrors={hasValidationErrors}
 * />
 */
export const QuoteFormActions = ({ isSubmitting, mode, onCancel, hasErrors }: QuoteFormActionsProps & { hasErrors?: boolean }) => {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      {hasErrors && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <span className="animate-pulse">●</span>
          <span>Check the highlighted fields</span>
        </div>
      )}
      
      <div className="flex gap-3 ml-auto">
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
          className={cn("gap-2", hasErrors && "animate-pulse border-destructive")}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              {mode === 'edit' ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            mode === 'edit' ? 'Update Quote' : 'Create Quote'
          )}
        </Button>
      </div>
    </div>
  );
};