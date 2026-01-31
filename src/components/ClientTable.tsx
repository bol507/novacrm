import { Link } from 'react-router-dom';
import { type Client } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Building2,  Briefcase } from 'lucide-react';


interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  onClientClick: (client: Client) => void;
}

// Formateador de moneda
const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return '-';
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const ClientTable = ({ clients, isLoading, onClientClick }: ClientTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Card 
          key={client.accountid} 
          className="hover:bg-accent/50 transition-colors"
          onClick={() => onClientClick(client)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              {/* Información principal */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{client.accountname}</h3>
                
                {/* Tipo de cuenta e industria */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                  {client.account_type && (
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                      <Building2 className="w-3 h-3" />
                      {client.account_type}
                    </span>
                  )}
                  {client.industry && (
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                      <Briefcase className="w-3 h-3" />
                      {client.industry}
                    </span>
                  )}
                </div>

                {/* Contacto */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {client.email1 && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {client.email1}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Ingresos y estado */}
              <div className="flex flex-col items-end gap-2 min-w-[120px]">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Ingresos anuales</span>
                  <span className="font-medium text-sm">{formatCurrency(client.annualrevenue)}</span>
                </div>
                
                <Badge variant={client.is_active ? "default" : "secondary"}>
                  {client.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};