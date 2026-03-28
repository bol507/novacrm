import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

// Custom hooks
import { useCreateContact } from "../hooks/use-create-contact";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";

// Presentational components (reused from ContactFormDialog)
import { ContactFormTitle } from "../components/ContactFormDialog/ContactFormTitle";
import { ContactFormMainFields } from "../components/ContactFormDialog/ContactFormMainFields";
import { ContactFormAccountSearch, type AccountSearchResult } from "../components/ContactFormDialog/ContactFormAccountSearch";
import { ContactFormUserSearch, type UserSearchResult } from "../components/ContactFormDialog/ContactFormUserSearch";
import { ContactFormContactInfo } from "../components/ContactFormDialog/ContactFormContactInfo";
import { ContactFormAdditionalInfo } from "../components/ContactFormDialog/ContactFormAdditionalInfo";
import { ContactFormActions } from "../components/ContactFormDialog/ContactFormActions";

// Types
import type { ContactFormData, ContactFormValues } from "../types/contact";

/**
 * Zod validation schema for the contact form.
 * Defines validation rules for all contact fields.
 */
const contactFormSchema = z.object({
  firstname: z.string().max(100).optional(),
  lastname: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  accountid: z.number().optional(),
  assigned_user_id: z.number().optional(),
  description: z.string().optional(),
  account_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
  mailingstreet: z.string().optional(),
  mailingcity: z.string().optional(),
  mailingstate: z.string().optional(),
  mailingcountry: z.string().optional(),
  mailingzip: z.string().optional(),
  otherphone: z.string().optional(),
  fax: z.string().optional(),
  secondaryemail: z.string().email().optional().or(z.literal('')),
  assistant: z.string().optional(),
  birthdate: z.string().optional(),
  reports_to_id: z.number().optional(),
  leadsource: z.string().optional(),
  contact_status: z.enum(['Active', 'Inactive']).optional(),
});

/**
 * ContactCreatePage Component.
 *
 * Dedicated page for creating a new contact.
 * Provides better UX than dialog for complex forms.
 *
 * Features:
 * - Form with validation for all contact fields
 * - Account and user search with autocomplete
 * - Pre-selects account from URL query parameter if provided
 * - Handles form submission with loading state
 * - Navigation back on cancel or success
 *
 * @component
 * @returns The rendered contact creation page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/contacts/new" element={<ContactCreatePage />} />
 *
 * @example
 * // Navigate with account pre-selected
 * navigate('/dashboard/contacts/new?accountId=123');
 */
const ContactCreatePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createContactMutation = useCreateContact();

  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    searchParams.get('accountId') ? parseInt(searchParams.get('accountId')!, 10) : null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAccountValid, setIsAccountValid] = useState(!!selectedAccountId);
  const [isUserValid, setIsUserValid] = useState(false);

  const { data: accountResults, isLoading: accountsLoading } = useSearchClients(accountSearchTerm);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      mobile: "",
      title: "",
      department: "",
      accountid: selectedAccountId || 0,
      assigned_user_id: undefined,
      description: "",
      account_search: '',
      assigned_user_search: '',
      fax: '',
      secondaryemail: '',
    },
  });

  /**
   * Handles form submission to create a new contact.
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
        ...(selectedAccountId ? { accountid: selectedAccountId } : {}),
        ...(selectedUserId ? { assigned_user_id: selectedUserId } : {}),
        description: data.description || undefined,
        
        fax: data.fax || undefined,
        secondaryemail: data.secondaryemail || undefined,
       
      };

      const newContactId = await createContactMutation.mutateAsync(payload);
      toast.success('Contact created successfully');
      navigate(`/dashboard/contacts/${newContactId}`);

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error creating contact');
      throw error;
    }
  };

  /**
   * Handles account selection from search results.
   *
   * @param account - Selected account result
   */
  const handleSelectAccount = (account: AccountSearchResult) => {
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
  const handleSelectUser = (user: UserSearchResult) => {
    const userId = user.id ?? user.user_id ?? null;
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name;
    form.setValue('assigned_user_search', userName);
    form.setValue('assigned_user_id', userId);
    setSelectedUserId(userId);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  /**
   * Handles cancellation of the create operation.
   */
  const handleCancel = () => {
    if (createContactMutation.isPending) {
      toast.warning('Please wait for the current operation to complete');
      return;
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header with navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={createContactMutation.isPending}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Contact</h1>
            <p className="text-muted-foreground">
              Create a new contact associated with a client
            </p>
          </div>
        </div>

        {/* Form in Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                {/* Header Section */}
                <ContactFormTitle mode="create" />

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
                  isSubmitting={form.formState.isSubmitting || createContactMutation.isPending}
                  mode="create"
                  onCancel={handleCancel}
                />

              </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  export default ContactCreatePage;