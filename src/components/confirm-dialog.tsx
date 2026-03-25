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
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

export const ConfirmDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [props, setProps] = useState<ConfirmDialogProps | null>(null);

  const showConfirm = (confirmProps: ConfirmDialogProps) => {
    setProps(confirmProps);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (props?.onConfirm) props.onConfirm();
    setIsOpen(false);
  };

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
            <DialogTitle>{props?.title || "¿Estás seguro?"}</DialogTitle>
            <DialogDescription>{props?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {props?.cancelLabel || "Cancelar"}
            </Button>
            <Button 
              variant={props?.variant || 'destructive'} 
              onClick={handleConfirm}>
              {props?.confirmLabel || "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context.showConfirm;
};