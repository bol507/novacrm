import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

// Custom hooks
import { useSearchUsers } from "@/features/users/hooks/use-search-users";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";

// Presentational components
import { ContactFormHeader } from "./ContactFormHeader";
import { ContactFormMainFields } from "./ContactFormMainFields";
import { ContactFormAccountSearch } from "./ContactFormAccountSearch";
import { ContactFormUserSearch } from "./ContactFormUserSearch";
import { ContactFormContactInfo } from "./ContactFormContactInfo";
import { ContactFormAdditionalInfo } from "./ContactFormAdditionalInfo";

// Types
import { contactFormSchema, type Contact, type ContactFormData, type ContactFormValues } from "../../types/contact";
import { ContactFormActions } from "./ContactFormActions";


/**
 * Props for ContactFormDialog container component.
 */
export interface ContactFormDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Callback to change dialog visibility */
  onOpenChange: (open: boolean) => void;
  /** Callback fired when form is submitted with validated data */
  onSubmit: (values: ContactFormData) => void | Promise<void>;
  /** Form mode: 'create' for new contact, 'edit' for existing (default: 'create') */
  mode?: 'create' | 'edit';
  /** Initial contact data for edit mode */
  initialData?: Contact;
  /** Default account ID (when creating from account detail page) */
  defaultAccountId?: number;
}

/**
 * ContactFormDialog Container Component.
 *
 * Orchestrates contact form state management, validation, and submission.
 * Composes presentational components for each form section.
 *
 * Features:
 * - React Hook Form integration with Zod validation
 * - Account search with autocomplete
 * - User search with autocomplete
 * - Responsive dialog with scrolling for long content
 * - Supports both create and edit modes
 *
 * @component
 * @param props - Component props
 * @param props.open - Dialog visibility
 * @param props.onOpenChange - Visibility change callback
 * @param props.onSubmit - Submit callback with validated data
 * @param props.mode - Form mode (default: 'create')
 * @param props.initialData - Initial data for edit mode
 * @param props.defaultAccountId - Default account ID for create mode
 * @returns The rendered contact form dialog
 *
 * @example
 * // Create mode
 * <ContactFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSubmit={handleCreateContact}
 *   mode="create"
 * />
 *
 * @example
 * // Edit mode with initial data
 * <ContactFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSubmit={handleUpdateContact}
 *   mode="edit"
 *   initialData={contact}
 * />
 *
 * @example
 * // Create mode with default account
 * <ContactFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSubmit={handleCreateContact}
 *   defaultAccountId={123}
 * />
 */
export const ContactFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData,
  defaultAccountId,
}: ContactFormDialogProps) => {
  // Search state
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    mode === 'edit' && initialData?.accountid 
      ? initialData.accountid 
      : defaultAccountId || null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id 
      ? initialData.assigned_user_id 
      : null
  );
  const [originalAccountId, setOriginalAccountId] = useState<number | null>(
    mode === 'edit' && initialData?.accountid ? initialData.accountid : null
  );
  const [originalUserId, setOriginalUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id ? initialData.assigned_user_id : null
  );
  const [isAccountValid, setIsAccountValid] = useState(
    mode === 'edit' && initialData?.accountid !== null
  );
  const [isUserValid, setIsUserValid] = useState(
    mode === 'edit' && initialData?.assigned_user_id !== null
  );

  // Custom hooks
  const { data: accountResults, isLoading: accountsLoading } = useSearchClients(accountSearchTerm);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  // Form setup
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: useMemo(() => {
      if (mode === 'edit' && initialData) {
        return {
          firstname: initialData.firstname,
          lastname: initialData.lastname,
          email: initialData.email,
          phone: initialData.phone || '',
          mobile: initialData.mobile || '',
          title: initialData.title || '',
          department: initialData.department || '',
          accountid: initialData.accountid,
          assigned_user_id: initialData.assigned_user_id,
          description: initialData.description || '',
          account_search: initialData.account_name || '',
          assigned_user_search: initialData.assigned_user_name || '',
          mailingstreet: initialData.mailingstreet || '',
          mailingcity: initialData.mailingcity || '',
          mailingstate: initialData.mailingstate || '',
          mailingcountry: initialData.mailingcountry || '',
          mailingzip: initialData.mailingzip || '',
          otherphone: initialData.otherphone || '',
          fax: initialData.fax || '',
          secondaryemail: initialData.secondaryemail || '',
          assistant: initialData.assistant || '',
          birthdate: initialData.birthdate || '',
          reports_to_id: initialData.reports_to_id,
          leadsource: initialData.leadsource || '',
          contact_status: initialData.contact_status || 'Active',
        };
      }
      return {
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        mobile: "",
        title: "",
        department: "",
        accountid: defaultAccountId || 0,
        assigned_user_id: 0,
        description: "",
        account_search: '',
        assigned_user_search: '',
        mailingstreet: '',
        mailingcity: '',
        mailingstate: '',
        mailingcountry: '',
        mailingzip: '',
        otherphone: '',
        fax: '',
        secondaryemail: '',
        assistant: '',
        birthdate: '',
        reports_to_id: undefined,
        leadsource: '',
        contact_status: 'Active',
      };
    }, [mode, initialData, defaultAccountId]),
  });

  /**
   * Handles form submission with payload transformation.
   *
   * @param data - Validated form values
   */
  const handleSubmit = async (data: ContactFormValues) => {
    try {
      const payload: ContactFormData = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone || undefined,
        mobile: data.mobile || undefined,
        title: data.title || undefined,
        department: data.department || undefined,
        ...(selectedAccountId 
          ? { accountid: selectedAccountId } 
          : (originalAccountId ? { accountid: originalAccountId } : {})),
        ...(selectedUserId 
          ? { assigned_user_id: selectedUserId } 
          : (originalUserId ? { assigned_user_id: originalUserId } : {})),
        description: data.description || undefined,
        mailingstreet: data.mailingstreet || undefined,
        mailingcity: data.mailingcity || undefined,
        mailingstate: data.mailingstate || undefined,
        mailingcountry: data.mailingcountry || undefined,
        mailingzip: data.mailingzip || undefined,
        otherphone: data.otherphone || undefined,
        fax: data.fax || undefined,
        secondaryemail: data.secondaryemail || undefined,
        assistant: data.assistant || undefined,
        birthdate: data.birthdate || undefined,
        reports_to_id: data.reports_to_id,
        leadsource: data.leadsource || undefined,
        contact_status: data.contact_status || 'Active',
      };

      await onSubmit(payload);
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting contact form:', error);
    }
  };

  /**
   * Handles account selection from search results.
   *
   * @param account - Selected account result
   */
  const handleSelectAccount = (account: any) => {
    form.setValue('account_search', account.accountname);
    form.setValue('accountid', account.id);
    setSelectedAccountId(account.id);
    setIsAccountValid(true);
    setAccountSearchTerm('');
  };

  /**
   * Handles user selection from search results.
   *
   * @param user - Selected user result
   */
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
            {mode === 'edit' ? 'Edit Contact' : 'New Contact'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Header Section */}
            <ContactFormHeader mode={mode} />

            {/* Main Fields: Name, Email, Title */}
            <ContactFormMainFields
              control={form.control}
            />

            {/* Account Search */}
            <ContactFormAccountSearch
              control={form.control}
              searchTerm={accountSearchTerm}
              onSearchChange={setAccountSearchTerm}
              onSelect={handleSelectAccount}
              results={accountResults}
              isLoading={accountsLoading}
              isValid={isAccountValid}
              originalAccountId={originalAccountId}
            />

            {/* User Search */}
            <ContactFormUserSearch
              control={form.control}
              searchTerm={userSearchTerm}
              onSearchChange={setUserSearchTerm}
              onSelect={handleSelectUser}
              results={userResults}
              isLoading={usersLoading}
              isValid={isUserValid}
              originalUserId={originalUserId}
            />

            {/* Contact Info: Phone, Mobile, Department */}
            <ContactFormContactInfo
              control={form.control}
            />

            {/* Additional Info: Address, Secondary Email, etc. */}
            <ContactFormAdditionalInfo
              control={form.control}
            />

            {/* Form Actions */}
            <ContactFormActions
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

export default ContactFormDialog;