import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Client } from "@/features/clients/types/client";

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  onView?: (client: Client) => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return "-";
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-500/10 text-green-600 border-green-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";
};

export const ClientTable = ({
  clients,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: ClientTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(6)].map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Cliente</TableHead>
               <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.accountid}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onView?.(client)}
              >
                 {/* Cliente: Nombre + Código */}
                <TableCell>
                  <div className="font-medium truncate max-w-48" title={client.accountname}>
                    {client.accountname}
                  </div>
                  <div className="text-xs text-muted-foreground">{client.account_no}</div>
                </TableCell>
                
                {/* Email (columna separada) */}
                <TableCell>
                  <div className="truncate max-w-40" title={client.email1 || undefined}>
                    {client.email1 || "-"}
                  </div>
                </TableCell>

                {/* Teléfono (columna separada) */}
                <TableCell>
                  {client.phone || "-"}
                </TableCell>
                {/* Ingresos (se mantiene, aunque esté vacío por ahora) */}
                <TableCell className="text-right font-medium">
                  {formatCurrency(client.annualrevenue)}
                </TableCell>
                 {/* Estado */}
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(client.is_active)}>
                    {client.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(client); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(client); }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); onDelete(client); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientTable;