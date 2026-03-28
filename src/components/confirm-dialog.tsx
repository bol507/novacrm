import { createContext, useContext, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogContextProps {
  showConfirm: (props: ConfirmDialogProps) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextProps>({
  showConfirm: () => { },
});

export interface ConfirmDialogProps {
  /** Optional title for the confirmation dialog */
  title?: string;
  /** Description text explaining the action to confirm */
  description: string;
  /** Optional label for the confirm button (default: "Confirm") */
  confirmLabel?: string;
  /** Optional label for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Callback invoked when the confirm button is clicked */
  onConfirm?: () => void;
  /** Callback invoked when the cancel button is clicked or dialog is closed */
  onCancel?: () => void;
  /** Visual style variant for the confirm button (default: 'destructive') */
  variant?: 'default' | 'destructive';
}

/**
 * ConfirmDialogProvider component that provides a global confirmation dialog context.
 *
 * Features:
 * - Provides a centralized confirmation dialog accessible anywhere in the app
 * - Configurable title, description, and button labels
 * - Support for different button variants (default or destructive)
 * - Handles confirm and cancel callbacks
 * - Automatically closes the dialog after action
 *
 * @component
 * @param props - Component props
 * @param props.children - Child components that will have access to the confirm dialog
 * @returns The provider component wrapping children with confirm dialog context
 *
 * @example
 * // Wrap your app or layout
 * <ConfirmDialogProvider>
 *   <App />
 * </ConfirmDialogProvider>
 */
export const ConfirmDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [props, setProps] = useState<ConfirmDialogProps | null>(null);

  /**
   * Shows the confirmation dialog with the provided configuration.
   *
   * @param confirmProps - Configuration for the confirmation dialog
   */
  const showConfirm = (confirmProps: ConfirmDialogProps) => {
    setProps(confirmProps);
    setIsOpen(true);
  };

  /**
   * Handles confirm button click, executes the onConfirm callback if provided,
   * and closes the dialog.
   */
  const handleConfirm = () => {
    if (props?.onConfirm) props.onConfirm();
    setIsOpen(false);
  };

  /**
   * Handles cancel button click, executes the onCancel callback if provided,
   * and closes the dialog.
   */
  const handleCancel = () => {
    if (props?.onCancel) props.onCancel();
    setIsOpen(false);
  };

  return (
    <>
      <ConfirmDialogContext.Provider value={{ showConfirm }}>
        {children}
      </ConfirmDialogContext.Provider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{props?.title || "Are you sure?"}</DialogTitle>
            <DialogDescription>{props?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {props?.cancelLabel || "Cancel"}
            </Button>
            <Button 
              variant={props?.variant || 'destructive'} 
              onClick={handleConfirm}>
              {props?.confirmLabel || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Hook to access the confirmation dialog functionality.
 *
 * @returns Function to show the confirmation dialog with custom configuration
 * @throws {Error} If used outside of ConfirmDialogProvider
 *
 * @example
 * // Basic usage
 * const showConfirm = useConfirm();
 *
 * const handleDelete = () => {
 *   showConfirm({
 *     title: "Delete Item",
 *     description: "Are you sure you want to delete this item? This action cannot be undone.",
 *     confirmLabel: "Delete",
 *     onConfirm: () => deleteItem(),
 *   });
 * };
 *
 * @example
 * // With custom variant and callbacks
 * const showConfirm = useConfirm();
 *
 * const handleSave = () => {
 *   showConfirm({
 *     title: "Save Changes",
 *     description: "You have unsaved changes. Do you want to save them?",
 *     confirmLabel: "Save",
 *     cancelLabel: "Discard",
 *     variant: "default",
 *     onConfirm: () => saveChanges(),
 *     onCancel: () => discardChanges(),
 *   });
 * };
 */
export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context.showConfirm;
};