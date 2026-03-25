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

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showConfirm = useConfirm();

  const clientId = parseInt(id || "0");
  const { data: client, isLoading, error } = useClient(clientId);
  const { data: summary, isLoading: isLoadingSummary } = useClientSummary(client?.accountid);
  const deleteClientMutation = useDeleteClient();

  // Formateador de moneda consistente (USD)
  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return "-";
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Color para el badge de rating
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

  // Componente reutilizable para items de información
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

  // Componente para direcciones
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
        <p className="text-sm text-muted-foreground italic">No definida</p>
      )}
    </div>
  );

  // Handler para editar
  const handleEdit = () => {
    if (!client) return;
    navigate(`/dashboard/clients/${client.accountid}/edit`);
  };

  // Handler para eliminar con confirmación
  const handleDelete = async () => {
    if (!client) return;

    await showConfirm({
      title: "¿Eliminar cliente?",
      description: `¿Estás seguro de eliminar "${client.accountname}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteClientMutation.mutateAsync(client.accountid);
          toast.success("Cliente eliminado exitosamente");
          navigate("/dashboard/clients");
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Error al eliminar el cliente");
        }
      },


    });
  };
  // Estado de carga
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

  // Estado de error
  if (error || !client) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-destructive mb-2">Cliente no encontrado</div>
            <Button asChild>
              <a href="/dashboard/clients">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a clientes
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con acciones */}
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
            {client.rating || "Sin estado"}
          </Badge>
          <Badge variant={client.is_active ? "default" : "secondary"}>
            {client.is_active ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClientMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteClientMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>

      {/* Stats de entidades relacionadas */}
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

      {/* Grid principal de información */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="w-5 h-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={Mail} label="Email Principal" value={client.email1} />
            <InfoItem icon={Mail} label="Email Secundario" value={client.email2} />
            <InfoItem icon={Phone} label="Teléfono Principal" value={client.phone} />
            <InfoItem icon={Phone} label="Teléfono Secundario" value={client.otherphone} />
            <InfoItem icon={FileText} label="Fax" value={client.fax} />
            <InfoItem icon={Globe} label="Sitio Web" value={client.website} link={client.website || undefined} />
          </CardContent>
        </Card>

        {/* Información de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={Tag} label="Tipo de Cuenta" value={client.account_type} />
            <InfoItem icon={Building2} label="Industria" value={client.industry} />
            <InfoItem icon={Users} label="Empleados" value={client.employees?.toString() || null} />
            <InfoItem icon={DollarSign} label="Ingresos Anuales" value={formatCurrency(client.annualrevenue)} />
            <InfoItem icon={Hash} label="Código SIC" value={client.siccode} />
            <InfoItem icon={Tag} label="Símbolo Bursátil" value={client.tickersymbol} />
          </CardContent>
        </Card>
      </div>

      {/* Direcciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5" />
            Direcciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <AddressBlock
              title="Dirección de Facturación"
              street={client.bill_street}
              city={client.bill_city}
              state={client.bill_state}
              code={client.bill_code}
              country={client.bill_country}
              pobox={client.bill_pobox}
            />
            <AddressBlock
              title="Dirección de Envío"
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

      {/* Información Adicional y Configuración */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Detalles Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Detalles Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={Tag} label="Propiedad" value={client.ownership} />
            <InfoItem icon={Tag} label="Etiquetas" value={client.tags} />
            {client.createdtime && (
              <InfoItem icon={Calendar} label="Creado" value={new Date(client.createdtime).toLocaleDateString("es-PA")} />
            )}
            {client.modifiedtime && (
              <InfoItem icon={Calendar} label="Última Modificación" value={new Date(client.modifiedtime).toLocaleDateString("es-PA")} />
            )}
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-5 h-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Email Marketing</p>
                <p className="text-xs text-muted-foreground">
                  {client.emailoptout === "1" ? "Cliente opt-out" : "Recibe correos"}
                </p>
              </div>
              <Badge variant={client.emailoptout === "1" ? "destructive" : "default"}>
                {client.emailoptout === "1" ? "Deshabilitado" : "Habilitado"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Notificaciones</p>
                <p className="text-xs text-muted-foreground">
                  Al propietario del registro
                </p>
              </div>
              <Badge variant={client.notify_owner === "1" ? "default" : "secondary"}>
                {client.notify_owner === "1" ? "Activas" : "Inactivas"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Origen</p>
                <p className="text-xs text-muted-foreground">
                  Fuente de creación del cliente
                </p>
              </div>
              <Badge variant={client.isconvertedfromlead === "1" ? "default" : "secondary"}>
                {client.isconvertedfromlead === "1" ? "Desde Lead" : "Directo"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetailPage;