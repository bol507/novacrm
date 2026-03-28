import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export interface ContactFormHeaderProps {
  /** Form mode: 'create' for new contact, 'edit' for existing */
  mode: 'create' | 'edit';
}

/**
 * ContactFormHeader component for displaying the dialog title.
 *
 * Simple presentational component that renders the appropriate title
 * based on the form mode.
 *
 * @component
 * @param props - Component props
 * @param props.mode - Form mode ('create' or 'edit')
 * @returns The rendered dialog header with title
 *
 * @example
 * // Create mode
 * <ContactFormHeader mode="create" />
 *
 * @example
 * // Edit mode
 * <ContactFormHeader mode="edit" />
 */
export const ContactFormHeader = ({ mode }: ContactFormHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>
        {mode === 'edit' ? 'Edit Contact' : 'New Contact'}
      </DialogTitle>
    </DialogHeader>
  );
};