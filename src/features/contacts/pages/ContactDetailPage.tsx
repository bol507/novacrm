import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Trash2, Building2, Mail, Phone, Smartphone, User,  FileText  } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useConfirm } from "@/components/confirm-dialog";

// Custom hooks
import { useContactDetail } from "../hooks/use-contact-detail";
import { useDeleteContact } from "../hooks/use-delete-contact";



/**
 * ContactDetailPage Container Component.
 *
 * Displays complete details of a single contact.
 * Handles loading, error, and empty states.
 *
 * Features:
 * - Displays comprehensive contact information in organized sections
 * - Shows status badge (Active/Inactive)
 * - Links to associated client account
 * - Edit and delete actions with confirmation
 * - Quick actions for creating quotes
 * - Metadata section with timestamps and assigned user
 * - Responsive layout with two-column grid
 *
 * @component
 * @returns The rendered contact detail page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/contacts/:contactId" element={<ContactDetailPage />} />
 *
 * @example
 * // Navigate to detail page
 * navigate(`/dashboard/contacts/${contactId}`);
 */
const ContactDetailPage = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const showConfirm = useConfirm();

  const { data: contact, isLoading, error, refetch } = useContactDetail(contactId);
  const deleteContactMutation = useDeleteContact();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-destructive text-4xl">⚠️</div>
              <h2 className="text-xl font-bold">Error Loading Contact</h2>
              <p className="text-muted-foreground">{error.message}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Back
                </Button>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">👤</div>
              <h2 className="text-xl font-bold">Contact Not Found</h2>
              <p className="text-muted-foreground">
                The contact you are looking for does not exist or has been deleted.
              </p>
              <Button onClick={() => navigate('/dashboard/contacts')}>
                Back to Contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Navigates to the contact edit page.
   */
  const handleEdit = () => {
    navigate(`/dashboard/contacts/${contactId}/edit`);
  };

  /**
   * Handles contact deletion with confirmation dialog.
   * Navigates back to contacts list on success.
   */
  const handleDelete = async () => {
    showConfirm({
      title: "Delete Contact?",
      description: `Are you sure you want to delete "${contact.firstname} ${contact.lastname}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteContactMutation.mutateAsync(contact.contactid);
          navigate('/dashboard/contacts');
        } catch (error) {
          toast.error('Error deleting contact');
        }
      },
    });
  };

  /**
   * Formats a date string to Spanish locale format.
   *
   * @param dateString - ISO date string or null/undefined
   * @returns Formatted date string or '-' if no date provided
   */
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header with navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {contact.firstname} {contact.lastname}
              </h1>
              <p className="text-muted-foreground">
                {contact.title || 'No title defined'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteContactMutation.isPending}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <Badge variant={contact.contact_status === 'Active' ? 'default' : 'secondary'}>
              {contact.contact_status === 'Active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Name" value={`${contact.firstname} ${contact.lastname}`} />
                    <InfoRow label="Email" value={contact.email} icon={Mail} href={`mailto:${contact.email}`} />
                    <InfoRow label="Phone" value={contact.phone} icon={Phone} href={contact.phone ? `tel:${contact.phone}` : undefined} />
                    <InfoRow label="Mobile" value={contact.mobile} icon={Smartphone} href={contact.mobile ? `tel:${contact.mobile}` : undefined} />
                    <InfoRow label="Title" value={contact.title} />
                    <InfoRow label="Department" value={contact.department} />
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Associated Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow
                    label="Client"
                    value={contact.account_name || `ID: ${contact.accountid}`}
                    onClick={() => navigate(`/dashboard/clients/${contact.accountid}`)}
                    className="cursor-pointer hover:text-primary"
                  />
                </CardContent>
              </Card>

             

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.secondaryemail && (
                      <InfoRow label="Secondary Email" value={contact.secondaryemail} icon={Mail} />
                    )}
                   
                  </div>

                  {contact.description && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {contact.description}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Contact ID" value={`#${contact.contactid}`} />
                  <InfoRow label="Created" value={formatDate(contact.createdtime)} />
                  <InfoRow label="Modified" value={formatDate(contact.modifiedtime)} />
                  {contact.assigned_user_name && (
                    <InfoRow label="Assigned To" value={contact.assigned_user_name} />
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleEdit}>
                    <Pencil className="h-4 w-4" />
                    Edit Contact
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate(`/dashboard/quotes/new?clientId=${contact.accountid}`)}>
                    <FileText className="h-4 w-4" />
                    New Quote
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Contact
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

/**
 * Helper component for displaying info rows.
 *
 * Features:
 * - Optional icon display
 * - Optional href for links (email, phone)
 * - Optional onClick handler
 * - Consistent styling across the detail page
 *
 * @param props - Component props
 * @param props.label - The label text for the info row
 * @param props.value - The value to display
 * @param props.icon - Optional icon component
 * @param props.href - Optional href for link rendering
 * @param props.onClick - Optional click handler
 * @param props.className - Additional CSS classes
 * @returns The rendered info row component
 */
const InfoRow = ({
  label,
  value,
  icon: Icon,
  href,
  onClick,
  className = ''
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  onClick?: () => void;
  className?: string;
}) => {
  if (!value) return null;

  const content = (
    <div className={`flex items-start gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground min-w-32">{label}:</span>
      <span className="text-sm font-medium break-all">{value}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:underline" onClick={(e) => e.stopPropagation()}>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground inline mr-1" />}
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left hover:underline">
        {content}
      </button>
    );
  }

  return (
    <div>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground inline mr-1" />}
      {content}
    </div>
  );
};

export default ContactDetailPage;