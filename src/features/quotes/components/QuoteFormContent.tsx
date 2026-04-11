import { useMemo, useState } from "react";
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";

// Custom hooks
import { useQuoteFormItems } from "../hooks/useQuoteFormItems";
import { useQuoteFormCalculations } from "../hooks/useQuoteFormCalculations";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";
import { useClient } from "@/features/clients/hooks/use-client";

// Presentational components
import {
  QuoteFormActions,
  QuoteFormClientSearch,
  QuoteFormDescription,
  QuoteFormFinancialSummary,
  QuoteFormHeader,
  QuoteFormItemsList,
  QuoteFormMainFields,
  QuoteFormUserSearch,
  type ClientSearchResult,
  type UserSearchResult
} from "./QuoteFormDialog";
import { normalizeFormStage, type FormQuoteStage, type Quote, type QuoteFormData, type QuoteFormValues } from "../types/quote";

/**
 * Validation schema for the quote form.
 * Defines all required fields and their validation rules.
 */
export const quoteFormSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(255),
  accountid: z.number().optional(),
  assigned_user_id: z.number().optional(),
  quote_stage: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']).default('Draft'),
  validtill: z.string().optional(),
  description: z.string().optional(),
  account_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
});

/**
 * Props for QuoteFormContent component
 */
export interface QuoteFormContentProps {
  /** Form mode: 'create' for new quote, 'edit' for existing */
  mode: 'create' | 'edit';
  /** Initial quote data for edit mode */
  initialData?: Quote;
  /** Initial client ID for create mode (optional) */
  initialClientId?: number;
  /** Callback fired when form is submitted with validated data */
  onSubmit: (values: QuoteFormData) => Promise<void>;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether form is submitting (optional, falls back to form's internal state) */
  isSubmitting?: boolean;
}

/**
 * QuoteFormContent Component
 *
 * Reusable form content for creating and editing quotes.
 * Can be used in dialogs, pages, or any container.
 *
 * Features:
 * - React Hook Form integration with Zod validation
 * - Dynamic items list management
 * - Client and user search with autocomplete
 * - Financial calculations (subtotal, ITBMS, total)
 * - Real-time error validation and scrolling to errors
 * - Server error handling with field-level mapping
 *
 * @component
 * @param props - Component props
 * @returns The rendered quote form content
 *
 * @example
 * // Create mode with client pre-selected
 * <QuoteFormContent
 *   mode="create"
 *   initialClientId={123}
 *   onSubmit={handleCreateQuote}
 *   onCancel={handleCancel}
 * />
 *
 * @example
 * // Edit mode with existing data
 * <QuoteFormContent
 *   mode="edit"
 *   initialData={quote}
 *   onSubmit={handleUpdateQuote}
 *   onCancel={handleCancel}
 * />
 */
export const QuoteFormContent = ({
  mode,
  initialData,
  initialClientId,
  onSubmit,
  onCancel,
  isSubmitting: externalSubmitting,
}: QuoteFormContentProps) => {
  // Search state
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    mode === 'edit' && initialData?.accountid ? initialData.accountid : 
    mode === 'create' && initialClientId ? initialClientId : null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id ? initialData.assigned_user_id : null
  );
  const [isClientValid, setIsClientValid] = useState(
    (mode === 'edit' && initialData?.accountid !== null) ||
    (mode === 'create' && initialClientId !== undefined)
  );
  const [isUserValid, setIsUserValid] = useState(
    mode === 'edit' && initialData?.assigned_user_id !== null
  );

  // Custom hooks
  const { items, addItem, removeItem, updateItem, canRemoveItems } = useQuoteFormItems(initialData?.items);
  const { subtotal, itbms, totalWithTax, formatCurrency } = useQuoteFormCalculations(items);
  const { data: clientResults, isLoading: clientsLoading } = useSearchClients(clientSearchTerm);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  // Fetch client data when initialClientId is provided
  const { data: clientData } = useClient(
    mode === 'create' && initialClientId ? initialClientId : null
  );

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
        accountid: initialClientId || 0,
        assigned_user_id: 0,
        quote_stage: "Draft" as FormQuoteStage,
        validtill: undefined,
        description: "",
        account_search: '',
        assigned_user_search: '',
      };
    }, [mode, initialData, initialClientId]),
  });

  // Scroll to and focus the first field with an error on submission
  useEffect(() => {
    const errorCount = Object.keys(form.formState.errors).length;
    if (errorCount > 0 && form.formState.isSubmitted) {
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstErrorField as HTMLElement).focus?.();
      }
    }
  }, [form.formState.errors, form.formState.isSubmitted]);

  // Set client name in form when client data is fetched
  useEffect(() => {
    if (mode === 'create' && clientData && initialClientId) {
      form.setValue('account_search', clientData.accountname);
      form.setValue('accountid', clientData.accountid);
    }
  }, [mode, clientData, initialClientId, form]);

  /**
   * Displays validation errors in a toast notification.
   *
   * @param errors - Form validation errors object
   */
  const showValidationErrors = (errors: any) => {
    const errorMessages: string[] = [];

    if (errors.subject?.message) {
      errorMessages.push(`• Subject: ${errors.subject.message}`);
    }
    if (errors.accountid?.message || !isClientValid) {
      errorMessages.push('• Client: You must select a client from the list');
    }
    if (errors.assigned_user_id?.message || !isUserValid) {
      errorMessages.push('• Assigned To: You must select a user from the list');
    }
    if (errors.validtill?.message) {
      errorMessages.push(`• Valid Until: ${errors.validtill.message}`);
    }

    const invalidItems = items.filter((item, _index) => {
      return !item.productname?.trim() || item.quantity <= 0 || item.listprice <= 0;
    });

    if (invalidItems.length > 0) {
      errorMessages.push(`• Items: ${invalidItems.length} item(s) have invalid data (name, quantity or price)`);
    }

    if (errorMessages.length > 0) {
      toast.error('Please check the following fields:', {
        description: (
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ),
        duration: 8000,
      });
    }
  };

  /**
   * Handles form submission with validation and payload construction.
   *
   * @param data - Form values from React Hook Form
   */
  const handleSubmit = async (data: QuoteFormValues) => {
    try {
      // Validate items before submission
      const validItems = items.filter(item =>
        item.productname?.trim() && item.quantity > 0 && item.listprice > 0
      );
      
      if (validItems.length === 0) {
        form.setError('root', {
          type: 'manual',
          message: 'You must add at least one valid item with name, quantity and price'
        });
        showValidationErrors({ root: { message: 'Invalid items' } });
        return;
      }

      // Validate client and user selection - check both state AND form values
      const formAccountId = form.getValues('accountid');
      const hasClient = isClientValid || selectedClientId || formAccountId;

      if (!hasClient) {
        form.setError('accountid', {
          type: 'manual',
          message: 'You must select a client from the search list'
        });
      } else {
        // Client is valid
      }

      // If there are manual errors, show and stop
      if (Object.keys(form.formState.errors).length > 0) {
        showValidationErrors(form.formState.errors);
        return;
      }

      // Build payload - use both state and form values
      const accountIdFromForm = form.getValues('accountid');
      const userIdFromForm = form.getValues('assigned_user_id');
      const payloadAccountId = selectedClientId ?? accountIdFromForm ?? data.accountid;
      const payloadUserId = selectedUserId ?? userIdFromForm ?? data.assigned_user_id;
      
      // Ensure we always have an accountid
      const finalAccountId = payloadAccountId || 101; // Fallback for debugging
      
      const payload: QuoteFormData = {
        subject: data.subject,
        potentialid: initialData?.potentialid || null,
        accountid: finalAccountId,
        assigned_user_id: payloadUserId,
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

      if (mode === 'create') {
        form.reset();
      }

    } catch (error: any) {
      const backendError = error.response?.data?.error || error.message || 'Unknown error';

      toast.error('Error saving quote', {
        description: backendError,
        duration: 6000,
      });

      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]: [string, any]) => {
          form.setError(field as any, {
            type: 'server',
            message: Array.isArray(messages) ? messages.join(', ') : messages,
          });
        });
        showValidationErrors(form.formState.errors);
      }

      throw error;
    }
  };

  /**
   * Handles client selection from search results.
   *
   * @param client - Selected client result
   */
  const handleSelectClient = (client: ClientSearchResult) => {
    form.setValue('account_search', client.accountname);
    form.setValue('accountid', client.id);
    setSelectedClientId(client.id);
    setIsClientValid(true);
    setClientSearchTerm('');
  };

  /**
   * Handles user selection from search results.
   *
   * @param user - Selected user result
   */
  const handleSelectUser = (user: UserSearchResult) => {
    const userId = user.id ?? user.user_id;

    if (userId === undefined || userId === null || isNaN(Number(userId))) {
      toast.error('Selected user does not have a valid ID');
      return;
    }

    const userIdNumber = Number(userId);
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name;

    form.setValue('assigned_user_search', userName);
    form.setValue('assigned_user_id', userIdNumber);
    setSelectedUserId(userIdNumber);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  const isSubmitting = externalSubmitting ?? form.formState.isSubmitting;

  return (
    <Form {...form}>
      {(() => {
        return null;
      })()}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header Section */}
        <QuoteFormHeader mode={mode} />

        {/* Main Fields: Subject, Stage, Valid Until */}
        <QuoteFormMainFields control={form.control} mode={mode} />

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
        <QuoteFormDescription control={form.control} />

        {/* Form Actions */}
        <QuoteFormActions
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
};