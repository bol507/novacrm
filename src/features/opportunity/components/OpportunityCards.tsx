
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DollarSign,
  Calendar,
  Users,
  Building2,
  MoreVertical,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Opportunity } from '../types/opportunity';

interface OpportunityCardsProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onViewOpportunity: (opportunity: Opportunity) => void;
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onDeleteOpportunity?: (opportunity: Opportunity) => void;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return '-';
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};


const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'Closed Won':
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'Closed Lost':
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case 'Proposal/Price Quote':
    case 'Negotiation/Review':
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  }
};

export const OpportunityCards = ({
  opportunities,
  isLoading,
  onViewOpportunity,
  onEditOpportunity,
  onDeleteOpportunity
}: OpportunityCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-card text-card-foreground border rounded-lg p-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="px-4 pb-4 space-y-3">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
              <div className="px-4 py-3 bg-muted/30 border-t">
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron oportunidades</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opportunity) => (
        <Card key={opportunity.potentialid} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Card Header */}
            <div className="flex items-start justify-between p-4 pb-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {opportunity.potentialname}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {opportunity.potential_no}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOpportunity(opportunity);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditOpportunity?.(opportunity);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOpportunity?.(opportunity);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Card Body */}
            <div className="px-4 pb-4 space-y-3">
              {/* Valor y probabilidad */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatCurrency(opportunity.amount)}
                  </span>
                </div>
                {opportunity.probability && (
                  <span className="text-sm text-muted-foreground">
                    {opportunity.probability}%
                  </span>
                )}
              </div>

              {opportunity.closingdate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Cierre: {formatDate(opportunity.closingdate)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                {opportunity.related_to_name && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cliente: {opportunity.related_to_name}</span>
                  </div>
                )}
                {opportunity.assigned_user_name && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Asignado: {opportunity.assigned_user_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 bg-muted/30 border-t">
              <Badge variant="outline" className={getStageColor(opportunity.sales_stage)}>
                {opportunity.sales_stage}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};