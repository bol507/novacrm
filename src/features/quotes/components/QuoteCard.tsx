import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type { Quote } from "../types/quote";

interface QuoteCardProps {
  quote: Quote;
  onEditQuote?: (quote: Quote) => void;
  onDeleteQuote?: (quote: Quote) => void;
}

// ✅ Export con nombre (no default)
export const QuoteCard = ({ 
  quote, 
  onEditQuote, 
  onDeleteQuote 
}: QuoteCardProps) => {
  const navigate = useNavigate();

  const handleViewQuote = () => {
    navigate(`/dashboard/quotes/${quote.quoteid}`);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Determinar color del estado
  const getBadgeColor = () => {
    switch (quote.quote_stage) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Mapeo de estados a texto
  const getStatusLabel = () => {
    switch (quote.quote_stage) {
      case 'Draft': return 'Creada';
      case 'Sent': return 'Enviada';
      case 'Accepted': return 'Aceptada';
      case 'Rejected': return 'Rechazada';
      default: return quote.quote_stage;
    }
  };

  // Calcular impuestos (ITBMS 7%)
  const taxes = quote.taxes || [];
  const taxAmount = quote.total - quote.subtotal;
  const hasTaxes = taxes.length > 0 || taxAmount > 0;

  return (
    <Card className="border border-border hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-foreground line-clamp-2 cursor-pointer"
              onClick={handleViewQuote}
            >
              {quote.subject}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Cotización #{quote.quoteno}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded border ${getBadgeColor()}`}>
            {getStatusLabel()}
          </span>
        </div>

        {/* Panel financiero - corregido */}
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          {quote.discount_percent && quote.discount_percent > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Descuento:</span>
              <span className="text-destructive">
                -{quote.discount_percent}% ({formatCurrency(quote.subtotal * quote.discount_percent / 100)})
              </span>
            </div>
          )}
          {hasTaxes && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">ITBMS:</span>
              <span className="text-blue-600 font-medium">
                {formatCurrency(taxAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium mt-2 pt-2 border-t border-border">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(quote.total)}</span>
          </div>
        </div>

        {/* Descripción general */}
        {quote.description && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-lg font-semibold mb-2">Descripción</h4>
            <p 
              className="text-muted-foreground line-clamp-2 cursor-pointer"
              onClick={handleViewQuote}
            >
              {quote.description}
            </p>
          </div>
        )}

        {/* Ítems de la cotización */}
        {quote.items.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-lg font-semibold mb-2">Ítems</h4>
            <div className="space-y-2">
              {quote.items.slice(0, 2).map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between cursor-pointer"
                  onClick={handleViewQuote}
                >
                  <div>
                    <p className="font-medium truncate">{item.productname}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.listprice)}
                    </p>
                  </div>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
              {quote.items.length > 2 && (
                <div 
                  className="text-xs text-muted-foreground cursor-pointer"
                  onClick={handleViewQuote}
                >
                  +{quote.items.length - 2} ítems más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={(e) => {
              e.stopPropagation();
              handleViewQuote();
            }}
          >
            <Eye className="h-3 w-3" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onEditQuote?.(quote);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteQuote?.(quote);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};