import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // ✅ CORREGIDO: eliminar 'nullable' del import
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

// Custom hooks
import { useContactDetail } from "../hooks/use-contact-detail";
import { useUpdateContact } from "../hooks/use-update-contact";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";

// Presentational components
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
 * Zod validation schema for the contact form
 */
const contactFormSchema = z.object({
  firstname: z.string().max(40).optional(),
  lastname: z.string().min(1, "Last name is required").max(80),
  email: z.string().email("Invalid email").max(100).optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  title: z.string().max(50).optional(),
  department: z.string().max(30).optional(),
  
  // ✅ Nullable para coincidir con BD
  accountid: z.number().nullable().optional(),
  assigned_user_id: z.number().nullable().optional(),
  
  description: z.string().optional(),
  account_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
  
  // Campos reales de vtiger_contactdetails
  salutation: z.string().max(200).optional(),
  fax: z.string().max(50).optional(),
  reportsto: z.string().max(30).optional(),
  training: z.string().max(50).optional(),
  usertype: z.string().max(50).optional(),
  contacttype: z.string().max(50).optional(),
  otheremail: z.string().max(100).optional(),
  secondaryemail: z.string().email().max(100).optional().or(z.literal('')),
  donotcall: z.string().max(3).optional(),
  emailoptout: z.string().max(3).optional(),
  imagename: z.string().max(150).optional(),
  reference: z.string().max(3).optional(),
  notify_owner: z.string().max(3).optional(),
  isconvertedfromlead: z.string().max(3).optional(),
  tags: z.string().max(1).optional(),
});

const ContactEditPage = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  // ✅ Validación temprana
  if (!contactId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Invalid Contact ID</h2>
              <p className="text-muted-foreground">Could not identify the contact to edit.</p>
              <Button onClick={() => navigate('/dashboard/contacts')}>
                Back to Contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateContactMutation = useUpdateContact();
  const {  data:contact, isLoading, error } = useContactDetail(contactId);

  // Search state
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [originalAccountId, setOriginalAccountId] = useState<number | null>(null);
  const [originalUserId, setOriginalUserId] = useState<number | null>(null);
  const [isAccountValid, setIsAccountValid] = useState(true);
  const [isUserValid, setIsUserValid] = useState(true);

  const {  data:accountResults, isLoading: accountsLoading } = useSearchClients(accountSearchTerm);
  const {  data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  // ✅ Form setup con defaultValues completos
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
      accountid: null,
      assigned_user_id: null,
      description: "",
      account_search: '',
      assigned_user_search: '',
      salutation: '',
      fax: '',
      reportsto: '',
      training: '',
      usertype: '',
      contacttype: '',
      otheremail: '',
      secondaryemail: '',
      donotcall: '',
      emailoptout: '',
      imagename: '',
      reference: '',
      notify_owner: '',
      isconvertedfromlead: '',
      tags: '',
    },
  });

  // ✅ Cargar datos del contacto cuando estén disponibles
  useEffect(() => {
    if (contact) {
      form.reset({
        firstname: contact.firstname || '',
        lastname: contact.lastname,
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        title: contact.title || '',
        department: contact.department || '',
        accountid: contact.accountid ?? null,
        assigned_user_id: contact.assigned_user_id ?? null,
        description: contact.description || '',
        account_search: contact.account_name || '',
        assigned_user_search: contact.assigned_user_name || '',
        salutation: contact.salutation || '',
        fax: contact.fax || '',
        reportsto: contact.reportsto || '',
        training: contact.training || '',
        usertype: contact.usertype || '',
        contacttype: contact.contacttype || '',
        otheremail: contact.otheremail || '',
        secondaryemail: contact.secondaryemail || '',
        donotcall: contact.donotcall || '',
        emailoptout: contact.emailoptout || '',
        imagename: contact.imagename || '',
        reference: contact.reference || '',
        notify_owner: contact.notify_owner || '',
        isconvertedfromlead: contact.isconvertedfromlead || '',
        tags: contact.tags || '',
      });

      setSelectedAccountId(contact.accountid ?? null);
      setSelectedUserId(contact.assigned_user_id ?? null);
      setOriginalAccountId(contact.accountid ?? null);
      setOriginalUserId(contact.assigned_user_id ?? null);
    }
  }, [contact, form]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading contact...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !contact) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-destructive">Error Loading Contact</h2>
              <p className="text-muted-foreground">{error?.message || 'Contact not found'}</p>
              <Button onClick={() => navigate(-1)}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Handles form submission to update the contact
   */
  const handleSubmit = async ( data :ContactFormValues) => {
    try {
      // ✅ Construir payload con TODOS los campos que pueden cambiar
      const payload: ContactFormData = {
        // Required
        lastname: data.lastname,
        
        // Optional contact details
        firstname: data.firstname || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        mobile: data.mobile || undefined,
        title: data.title || undefined,
        department: data.department || undefined,
        salutation: data.salutation || undefined,
        fax: data.fax || undefined,
        reportsto: data.reportsto || undefined,
        training: data.training || undefined,
        usertype: data.usertype || undefined,
        contacttype: data.contacttype || undefined,
        otheremail: data.otheremail || undefined,
        secondaryemail: data.secondaryemail || undefined,
        donotcall: data.donotcall || undefined,
        emailoptout: data.emailoptout || undefined,
        imagename: data.imagename || undefined,
        reference: data.reference || undefined,
        notify_owner: data.notify_owner || undefined,
        isconvertedfromlead: data.isconvertedfromlead || undefined,
        tags: data.tags || undefined,
        
        // crmentity fields
        description: data.description || undefined,
        
        // ✅ Account: enviar solo si cambió o si es requerido
        ...(selectedAccountId !== originalAccountId || selectedAccountId !== null
          ? { accountid: selectedAccountId }
          : {}),
        
        // ✅ Assigned user: enviar solo si cambió explícitamente
        ...(selectedUserId !== originalUserId
          ? { assigned_user_id: selectedUserId ?? undefined }
          : {}),
      };

      // ✅ Ejecutar actualización
      await updateContactMutation.mutateAsync({
        id: parseInt(contactId),
        data: payload
      });

      toast.success('Contact updated successfully');
      navigate(`/dashboard/contacts/${contactId}`);

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error updating contact');
      throw error;
    }
  };

  const handleSelectAccount = (account: AccountSearchResult) => {
    form.setValue('account_search', account.accountname);
    form.setValue('accountid', account.id);
    setSelectedAccountId(account.id);
    setIsAccountValid(true);
    setAccountSearchTerm('');
  };

  const handleSelectUser = (user: UserSearchResult) => {
    const userId = user.id ?? user.user_id ?? null;
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name;
    form.setValue('assigned_user_search', userName);
    form.setValue('assigned_user_id', userId);
    setSelectedUserId(userId);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  const handleCancel = () => {
    if (updateContactMutation.isPending) {
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
            disabled={updateContactMutation.isPending}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Contact</h1>
            <p className="text-muted-foreground">
              #{contact.contactid} • {contact.firstname} {contact.lastname}
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

                <ContactFormTitle mode="edit" />

                <ContactFormMainFields control={form.control} />

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

                <ContactFormContactInfo control={form.control} />

                <ContactFormAdditionalInfo control={form.control} />

                <ContactFormActions
                  isSubmitting={form.formState.isSubmitting || updateContactMutation.isPending}
                  mode="edit"
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

export default ContactEditPage;