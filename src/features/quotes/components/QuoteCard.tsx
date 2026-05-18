import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Quote } from "../types/quote";
import { useNavigate } from "react-router-dom";
import { formatDateEs } from "@/shared/lib/utils";

export interface QuoteCardProps {
  quote: Quote;
  onEditQuote?: (quote: Quote) => void;
  onDeleteQuote?: (quote: Quote) => void;
}

/**
 * QuoteCard Component
 *
 * Displays a summary card for a quote with:
 * - Subject, quote number, and status badge
 * - Financial breakdown (subtotal, discount, tax, total)
 * - Preview of description and first 2 items
 * - Action buttons (view, edit, delete)
 *
 * @component
 * @param props - Component props
 * @param props.quote - Quote data to display
 * @param props.onEditQuote - Edit callback
 * @param props.onDeleteQuote - Delete callback
 * @returns Quote summary card
 */
export const QuoteCard = ({ 
  quote, 
  onEditQuote, 
  onDeleteQuote 
}: QuoteCardProps) => {
  const navigate = useNavigate();
  
  const handleViewQuote = () => {
    navigate(`/dashboard/quotes/${quote.quoteid}`);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getBadgeColor = () => {
    switch (quote.quote_stage) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    switch (quote.quote_stage) {
      case 'Draft': return 'Draft';
      case 'Sent': return 'Sent';
      case 'Accepted': return 'Accepted';
      case 'Rejected': return 'Rejected';
      default: return quote.quote_stage;
    }
  };

  const taxAmount = quote.total - quote.subtotal;
  const hasTaxes = taxAmount > 0;

  return (
    <Card className="border border-border hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-foreground line-clamp-2 cursor-pointer"
              onClick={handleViewQuote}
            >
              {quote.subject}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Quote #{quote.quoteno}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded border ${getBadgeColor()} shrink-0`}>
            {getStatusLabel()}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created: {formatDateEs(quote.createdtime)}</span>
          </div>
          
          {quote.validtill && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Expires: {formatDateEs(quote.validtill)}</span>
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="shrink-0">{formatCurrency(quote.subtotal)}</span>
          </div>
          
          {quote.discount_total && quote.discount_total > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-destructive shrink-0">
                {formatCurrency(quote.discount_total)}
              </span>
            </div>
          )}
          
          {hasTaxes && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">ITBMS:</span>
              <span className="text-blue-600 font-medium shrink-0">
                {formatCurrency(taxAmount)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between font-medium mt-2 pt-2 border-t border-border">
            <span>Total:</span>
            <span className="text-primary shrink-0">{formatCurrency(quote.total)}</span>
          </div>
        </div>

        {quote.description && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p 
              className="text-xs text-muted-foreground line-clamp-3 cursor-pointer wrap-break-word"
              onClick={handleViewQuote}
            >
              {quote.description}
            </p>
          </div>
        )}

        {quote.items && quote.items.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-2">Items</h4>
            <div className="space-y-2">
              {quote.items.slice(0, 2).map((item, index) => (
                <div 
                  key={item.sequence_no || index} 
                  className="flex justify-between items-start gap-2 cursor-pointer"
                  onClick={handleViewQuote}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={item.description || ''}>
                      {item.description}
                    </p>
                    
                    {item.comment && (
                      <p 
                        className="text-xs text-muted-foreground line-clamp-2 wrap-break-word mt-0.5"
                        title={item.comment}
                      >
                        {item.comment}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} × {formatCurrency(item.listprice)}
                    </p>
                  </div>
                  <span className="font-medium text-sm shrink-0">
                    {formatCurrency(item.total ?? 0)}
                  </span>
                </div>
              ))}
              {quote.items.length > 2 && (
                <div 
                  className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={handleViewQuote}
                >
                  +{quote.items.length - 2} more items →
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
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
            View
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