import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Globe, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useClient } from "@/hooks/use-client";

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id || '0');
  const { data: client, isLoading, error } = useClient(clientId);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/3 mb-2" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-1/2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-destructive mb-2">Cliente no encontrado</div>
            <Button asChild>
              <Link to="/dashboard/clients">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a clientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/clients">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{client.accountname}</h1>
          <p className="text-muted-foreground">ID: {client.account_no}</p>
        </div>
        <Badge variant={client.is_active ? "default" : "secondary"}>
          {client.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.email1 && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{client.email1}</span>
              </div>
            )}
            {client.email2 && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{client.email2}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.otherphone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{client.otherphone}</span>
              </div>
            )}
            {client.fax && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Fax:</span>
                <span>{client.fax}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {client.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.account_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{client.account_type}</span>
              </div>
            )}
            {client.industry && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industria:</span>
                <span>{client.industry}</span>
              </div>
            )}
            {client.employees && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empleados:</span>
                <span>{client.employees}</span>
              </div>
            )}
            {client.annualrevenue && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingresos anuales:</span>
                <span>
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(client.annualrevenue)}
                </span>
              </div>
            )}
            {client.rating && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calificación:</span>
                <Badge variant="outline" className={
                  client.rating === 'Active' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                  client.rating === 'Acquired' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                  'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {client.rating}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles Adicionales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {client.ownership && (
            <div>
              <span className="text-muted-foreground">Propiedad:</span>
              <div>{client.ownership}</div>
            </div>
          )}
          {client.siccode && (
            <div>
              <span className="text-muted-foreground">Código SIC:</span>
              <div>{client.siccode}</div>
            </div>
          )}
          {client.tickersymbol && (
            <div>
              <span className="text-muted-foreground">Símbolo bursátil:</span>
              <div>{client.tickersymbol}</div>
            </div>
          )}
          {client.tags && (
            <div>
              <span className="text-muted-foreground">Etiquetas:</span>
              <div>{client.tags}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailPage;