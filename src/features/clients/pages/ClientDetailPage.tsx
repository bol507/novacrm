import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Building2,
  Globe,
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Users,
  Tag,
  Hash,
  Settings,
  FileText,
  Calendar,
} from "lucide-react";
import { useClient } from "@/features/clients/hooks/use-client";
import { useClientSummary } from "../hooks/use-client-summary";
import { useDeleteClient } from "../hooks/use-delete-client";
import ClientStats from "../components/ClientStats";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";

/**
 * ClientDetailPage component for displaying detailed information about a client.
 *
 * Features:
 * - Fetches and displays client details by ID from URL parameters
 * - Shows loading skeleton while fetching data
 * - Displays error state when client not found
 * - Shows related entity statistics (opportunities, quotes, projects, contacts)
 * - Provides navigation to related entity lists filtered by this client
 * - Edit and delete actions with confirmation dialog
 *
 * @component
 * @returns The rendered client detail page
 */
const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showConfirm = useConfirm();

  const clientId = parseInt(id || "0");
  const { data: client, isLoading, error } = useClient(clientId);
  const { data: summary, isLoading: isLoadingSummary } = useClientSummary(client?.accountid);
  const deleteClientMutation = useDeleteClient();

  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return "-";
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getRatingColor = (rating: string | null): string => {
    switch (rating) {
      case "Active":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Acquired":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Shutdown":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleViewOpportunities = () => {
    navigate(`/dashboard/opportunities?clientId=${clientId}`);
  };

  const handleViewQuotes = () => {
    navigate(`/dashboard/quotes?clientId=${clientId}`);
  };

  const handleViewProjects = () => {
    navigate(`/dashboard/projects?clientId=${clientId}`);
  };

  const handleViewContacts = () => {
    navigate(`/dashboard/contacts?clientId=${clientId}`);
  };

  const handleEdit = () => {
    if (!client) return;
    navigate(`/dashboard/clients/${client.accountid}/edit`);
  };

  const handleDelete = async () => {
    if (!client) return;

    await showConfirm({
      title: "Delete Client?",
      description: `Are you sure you want to delete "${client.accountname}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteClientMutation.mutateAsync(client.accountid);
          toast.success("Client deleted successfully");
          navigate("/dashboard/clients");
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Error deleting client");
        }
      },
    });
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    link,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | null;
    link?: string;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <div className="p-2 rounded-lg bg-muted/50 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium truncate">{value || "-"}</p>
        )}
      </div>
    </div>
  );

  const AddressBlock = ({
    title,
    street,
    city,
    state,
    code,
    country,
    pobox,
  }: {
    title: string;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    code?: string | null;
    country?: string | null;
    pobox?: string | null;
  }) => (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">{title}</h4>
      {street && <p className="text-sm">{street}</p>}
      {(city || state) && (
        <p className="text-sm">
          {city}
          {city && state ? ", " : ""}
          {state}
        </p>
      )}
      {code && <p className="text-sm">{code}</p>}
      {country && <p className="text-sm">{country}</p>}
      {pobox && <p className="text-sm text-muted-foreground">P.O. Box: {pobox}</p>}
      {!street && !city && !state && !code && !country && !pobox && (
        <p className="text-sm text-muted-foreground italic">Not defined</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-destructive mb-2">Client not found</div>
            <Button asChild>
              <a href="/dashboard/clients">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to clients
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/clients")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.accountname}</h1>
            <p className="text-muted-foreground font-mono">{client.account_no}</p>
          </div>
          <Badge variant="outline" className={getRatingColor(client.rating)}>
            {client.rating || "No status"}
          </Badge>
          <Badge variant={client.is_active ? "default" : "secondary"}>
            {client.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClientMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteClientMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <ClientStats
        summary={
          summary || {
            clientId: client.accountid,
            opportunitiesCount: 0,
            quotesCount: 0,
            projectsCount: 0,
            contactsCount: 0,
          }
        }
        isLoading={isLoadingSummary}
        onViewOpportunities={handleViewOpportunities}
        onViewQuotes={handleViewQuotes}
        onViewProjects={handleViewProjects}
        onViewContacts={handleViewContacts}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={Mail} label="Primary Email" value={client.email1} />
            <InfoItem icon={Mail} label="Secondary Email" value={client.email2} />
            <InfoItem icon={Phone} label="Primary Phone" value={client.phone} />
            <InfoItem icon={Phone} label="Secondary Phone" value={client.otherphone} />
            <InfoItem icon={FileText} label="Fax" value={client.fax} />
            <InfoItem icon={Globe} label="Website" value={client.website} link={client.website || undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={Tag} label="Account Type" value={client.account_type} />
            <InfoItem icon={Building2} label="Industry" value={client.industry} />
            <InfoItem icon={Users} label="Employees" value={client.employees?.toString() || null} />
            <InfoItem icon={DollarSign} label="Annual Revenue" value={formatCurrency(client.annualrevenue)} />
            <InfoItem icon={Hash} label="SIC Code" value={client.siccode} />
            <InfoItem icon={Tag} label="Ticker Symbol" value={client.tickersymbol} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5" />
            Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <AddressBlock
              title="Billing Address"
              street={client.bill_street}
              city={client.bill_city}
              state={client.bill_state}
              code={client.bill_code}
              country={client.bill_country}
              pobox={client.bill_pobox}
            />
            <AddressBlock
              title="Shipping Address"
              street={client.ship_street}
              city={client.ship_city}
              state={client.ship_state}
              code={client.ship_code}
              country={client.ship_country}
              pobox={client.ship_pobox}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={Tag} label="Ownership" value={client.ownership} />
            <InfoItem icon={Tag} label="Tags" value={client.tags} />
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap">{client.description || "-"}</p>
            </div>
            {client.createdtime && (
              <InfoItem icon={Calendar} label="Created" value={new Date(client.createdtime).toLocaleDateString()} />
            )}
            {client.modifiedtime && (
              <InfoItem icon={Calendar} label="Last Modified" value={new Date(client.modifiedtime).toLocaleDateString()} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Email Marketing</p>
                <p className="text-xs text-muted-foreground">
                  {client.emailoptout === "1" ? "Client opted out" : "Receives emails"}
                </p>
              </div>
              <Badge variant={client.emailoptout === "1" ? "destructive" : "default"}>
                {client.emailoptout === "1" ? "Disabled" : "Enabled"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  To record owner
                </p>
              </div>
              <Badge variant={client.notify_owner === "1" ? "default" : "secondary"}>
                {client.notify_owner === "1" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Origin</p>
                <p className="text-xs text-muted-foreground">
                  Client creation source
                </p>
              </div>
              <Badge variant={client.isconvertedfromlead === "1" ? "default" : "secondary"}>
                {client.isconvertedfromlead === "1" ? "From Lead" : "Direct"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetailPage;