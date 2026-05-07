// src/features/procurement/components/presentational/MaterialRequestList.tsx

import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, CheckCircle, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MaterialRequest } from '../../types/procurement';

interface Props {
  requests: MaterialRequest[];
  isLoading: boolean;
  onNewRequest: () => void;
  onViewDetails: (id: number) => void;
  onApprove: (id: number) => void;
  canApprove: boolean;
  // ✅ NUEVO: Prop para navegar a cotizaciones (inyectado desde container)
  onViewQuotes?: (requestId: number) => void;
}

// ✅ AGREGAR el nuevo estado al config de badges
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'In Review', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  partially_approved: { label: 'Partial', variant: 'outline' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  procurement_in_progress: { label: 'En Cotización', variant: 'outline' }, 
  partially_procured: { label: 'In Procurement', variant: 'outline' },
  fully_procured: { label: 'Procured', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
};

export const MaterialRequestList = ({
  requests,
  isLoading,
  onNewRequest,
  onViewDetails,
  onApprove,
  canApprove,
  onViewQuotes, 
}: Props) => {
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground mb-4">No material requests</p>
        {canApprove && (
          <Button onClick={onNewRequest}>
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Material Requests</h2>
        {canApprove && (
          <Button onClick={onNewRequest} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const config = statusConfig[req.status] || statusConfig.draft;
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">#{req.id}</TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell>{req.requested_by_name}</TableCell>
                  <TableCell>
                    {format(new Date(req.created_at), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Ver detalle de solicitud */}
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(req.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* ✅ Botón Ver Cotizaciones (solo si está en progreso) */}
                    {req.status === 'procurement_in_progress' && onViewQuotes && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewQuotes(req.id); 
                        }}
                        title="Ver cotizaciones de esta solicitud"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Aprobar (si tiene permisos y está submitted) */}
                    {canApprove && req.status === 'submitted' && (
                      <Button variant="ghost" size="icon" onClick={() => onApprove(req.id)}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};