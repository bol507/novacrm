import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

// Custom hooks
import { useQuoteFormCalculations } from "../../hooks/useQuoteFormCalculations";
import { useQuoteFormItems } from "../../hooks/useQuoteFormItems";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";

// Presentational components

// Types
import { normalizeFormStage, type FormQuoteStage, type Quote, type QuoteFormData } from "../../types/quote";
import { QuoteFormHeader } from "./QuoteFormHeader";
import { QuoteFormMainFields } from "./QuoteFormMainFields";
import { QuoteFormActions, QuoteFormClientSearch, QuoteFormDescription, QuoteFormFinancialSummary, QuoteFormItemsList, QuoteFormUserSearch } from ".";


// Validation schema
const quoteFormSchema = z.object({
  subject: z.string().min(1, "Título requerido").max(255),
  accountid: z.number().min(1, "Cliente requerido"),
  assigned_user_id: z.number().min(1, "Usuario asignado requerido"),
  quote_stage: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']).default('Draft'),
  validtill: z.string().optional(),
  description: z.string().optional(),
  account_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

/**
 * Props for QuoteFormDialog container component
 */
export interface QuoteFormDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Callback to change dialog visibility */
  onOpenChange: (open: boolean) => void;
  /** Callback fired when form is submitted with validated data */
  onSubmit: (values: QuoteFormData) => void;
  /** Form mode: 'create' for new quote, 'edit' for existing */
  mode?: 'create' | 'edit';
  /** Initial quote data for edit mode */
  initialData?: Quote;
}

/**
 * QuoteFormDialog Container Component
 * 
 * Wraps QuoteFormContent in a Dialog for modal usage.
 * 
 * @deprecated Consider using dedicated pages (QuoteCreatePage/QuoteEditPage) for better UX
 */
export const QuoteFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData
}: QuoteFormDialogProps) => {
  // Search state
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    mode === 'edit' && initialData?.accountid ? initialData.accountid : null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id ? initialData.assigned_user_id : null
  );
  const [isClientValid, setIsClientValid] = useState(
    mode === 'edit' && initialData?.accountid !== null
  );
  const [isUserValid, setIsUserValid] = useState(
    mode === 'edit' && initialData?.assigned_user_id !== null
  );

  // Custom hooks
  const { items, addItem, removeItem, updateItem, canRemoveItems } = useQuoteFormItems(initialData?.items);
  const { subtotal, itbms, totalWithTax, formatCurrency } = useQuoteFormCalculations(items);
  const { data: clientResults, isLoading: clientsLoading } = useSearchClients(clientSearchTerm);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  // Form setup
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: useMemo(() => {
      if (mode === 'edit' && initialData) {
        return {
          subject: initialData.subject,
          accountid: initialData.accountid,
          assigned_user_id: initialData.assigned_user_id,
          quote_stage: normalizeFormStage(initialData.quote_stage),
          validtill: initialData.validtill || undefined,
          description: initialData.description || '',
          account_search: initialData.account_name || '',
          assigned_user_search: initialData.assigned_user_name || '',
        };
      }
      return {
        subject: "",
        accountid: 0,
        assigned_user_id: 0,
        quote_stage: "Draft" as FormQuoteStage,
        validtill: undefined,
        description: "",
        account_search: '',
        assigned_user_search: '',
      };
    }, [mode, initialData]),
  });

  // Form submission handler
  const handleSubmit = async (data: QuoteFormValues) => {
    try {
      // Validate items
      const validItems = items.filter(item =>
        item.productname?.trim() && item.quantity > 0 && item.listprice > 0
      );

      if (validItems.length === 0) {
        form.setError('root', {
          message: 'Debe agregar al menos un ítem válido a la cotización'
        });
        return;
      }

      // Build payload
      const payload: QuoteFormData = {
        subject: data.subject,
        potentialid: initialData?.potentialid || null,
        accountid: selectedClientId || data.accountid,
        assigned_user_id: selectedUserId || data.assigned_user_id,
        quote_stage: mode === 'create' ? 'Draft' : data.quote_stage,
        validtill: data.validtill || null,
        description: data.description || null,
        items: validItems.map(item => ({
          productid: item.productid,
          sequence_no: item.sequence_no,
          productname: item.productname,
          quantity: item.quantity,
          listprice: item.listprice,
          discount_percent: item.discount_percent || 0,
          description: item.description || null,
        }))
      };

      await onSubmit(payload);
      
      // Reset form on success
      form.reset();
      onOpenChange(false);

    } catch (error) {
      console.error('Error submitting quote form:', error);
    }
  };

  // Client selection handler
  const handleSelectClient = (client: any) => {
    form.setValue('account_search', client.accountname);
    form.setValue('accountid', client.id);
    setSelectedClientId(client.id);
    setIsClientValid(true);
    setClientSearchTerm('');
  };

  // User selection handler
  const handleSelectUser = (user: any) => {
    const userId = user.id || user.user_id;
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name;
    form.setValue('assigned_user_search', userName);
    form.setValue('assigned_user_id', userId);
    setSelectedUserId(userId);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Cotización' : 'Nueva Cotización'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Header Section */}
            <QuoteFormHeader mode={mode} />

            {/* Main Fields: Subject, Stage, Valid Until */}
            <QuoteFormMainFields
              control={form.control}
              mode={mode}
            />

            {/* Client Search */}
            <QuoteFormClientSearch
              control={form.control}
              searchTerm={clientSearchTerm}
              onSearchChange={setClientSearchTerm}
              onSelect={handleSelectClient}
              results={clientResults}
              isLoading={clientsLoading}
              isValid={isClientValid}
            />

            {/* User Search */}
            <QuoteFormUserSearch
              control={form.control}
              searchTerm={userSearchTerm}
              onSearchChange={setUserSearchTerm}
              onSelect={handleSelectUser}
              results={userResults}
              isLoading={usersLoading}
              isValid={isUserValid}
            />

            {/* Items List */}
            <QuoteFormItemsList
              items={items}
              onUpdate={updateItem}
              onAdd={addItem}
              onRemove={removeItem}
              canRemove={canRemoveItems}
              formatCurrency={formatCurrency}
            />

            {/* Financial Summary */}
            <QuoteFormFinancialSummary
              subtotal={subtotal}
              itbms={itbms}
              totalWithTax={totalWithTax}
              formatCurrency={formatCurrency}
            />

            {/* General Description */}
            <QuoteFormDescription
              control={form.control}
            />

            {/* Form Actions */}
            <QuoteFormActions
              isSubmitting={form.formState.isSubmitting}
              mode={mode}
              onCancel={() => onOpenChange(false)}
            />

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteFormDialog;