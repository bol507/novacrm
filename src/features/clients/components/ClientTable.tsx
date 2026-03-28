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
  /** Array of client objects to display */
  clients: Client[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Callback for viewing client details */
  onView?: (client: Client) => void;
  /** Callback for editing a client */
  onEdit?: (client: Client) => void;
  /** Callback for deleting a client */
  onDelete?: (client: Client) => void;
}

/**
 * Formats a number as USD currency with Panamanian locale.
 *
 * @param value - The number to format
 * @returns Formatted currency string or '-' if value is falsy
 */
const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return "-";
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Returns status badge color classes based on client active status.
 *
 * @param isActive - Whether the client is active
 * @returns Tailwind CSS classes for the status badge
 */
const getStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-500/10 text-green-600 border-green-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";
};

/**
 * ClientTable component for displaying clients in a responsive table format.
 *
 * Features:
 * - Skeleton loading state with animated placeholders
 * - Empty state when no clients are found
 * - Clickable rows for viewing client details
 * - Dropdown menu with view, edit, and delete actions
 * - Status badges with appropriate colors
 * - Currency formatting for annual revenue
 * - Responsive with horizontal scroll on small screens
 *
 * @component
 * @param props - Component props
 * @param props.clients - Array of client objects to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.onView - Callback for viewing client details
 * @param props.onEdit - Callback for editing a client
 * @param props.onDelete - Callback for deleting a client
 * @returns The rendered client table component
 *
 * @example
 * // Basic usage
 * <ClientTable
 *   clients={clients}
 *   isLoading={isLoading}
 *   onView={handleViewClient}
 *   onEdit={handleEditClient}
 *   onDelete={handleDeleteClient}
 * />
 *
 * @example
 * // Read-only mode without actions
 * <ClientTable
 *   clients={clients}
 *   isLoading={false}
 *   onView={handleViewClient}
 * />
 */
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
        <p className="text-muted-foreground">No clients found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>
                  <div className="font-medium truncate max-w-48" title={client.accountname}>
                    {client.accountname}
                  </div>
                  <div className="text-xs text-muted-foreground">{client.account_no}</div>
                </TableCell>

                <TableCell>
                  <div className="truncate max-w-40" title={client.email1 || undefined}>
                    {client.email1 || "-"}
                  </div>
                </TableCell>

                <TableCell>
                  {client.phone || "-"}
                </TableCell>

                <TableCell className="text-right font-medium">
                  {formatCurrency(client.annualrevenue)}
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className={getStatusColor(client.is_active)}>
                    {client.is_active ? "Active" : "Inactive"}
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
                          View details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(client); }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); onDelete(client); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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