import { Card, CardContent } from "@/components/ui/card";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Quote } from "../types/quote";

/**
 * Props for QuoteCard component
 */
export interface QuoteCardProps {
  /** Quote object to display */
  quote: Quote;
  /** Optional callback when edit button is clicked */
  onEditQuote?: (quote: Quote) => void;
  /** Optional callback when delete button is clicked */
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
 * @param {QuoteCardProps} props - Component props
 * @param {Quote} props.quote - Quote data to display
 * @param {function} [props.onEditQuote] - Edit callback
 * @param {function} [props.onDeleteQuote] - Delete callback
 * 
 * @returns {JSX.Element} Quote summary card
 * 
 * @example
 * // Basic usage
 * <QuoteCard quote={quote} />
 * 
 * @example
 * // With action handlers
 * <QuoteCard 
 *   quote={quote}
 *   onEditQuote={handleEdit}
 *   onDeleteQuote={handleDelete}
 * />
 * 
 * @remarks
 * - Card is clickable to navigate to quote detail page
 * - Financial values formatted in USD with Panama locale
 * - Shows up to 2 items with "+X more" indicator
 * - Status badge color varies by quote_stage
 * - Edit/delete buttons require explicit callbacks
 */
export const QuoteCard = ({ 
  quote, 
  onEditQuote, 
  onDeleteQuote 
}: QuoteCardProps) => {
  const navigate = useNavigate();

  /**
   * Navigate to quote detail page
   */
  const handleViewQuote = () => {
    navigate(`/dashboard/quotes/${quote.quoteid}`);
  };

  /**
   * Formats a numeric value as USD currency
   * 
   * Uses Panama Spanish locale (es-PA) with no decimal places
   * for consistent dashboard presentation.
   * 
   * @param value - Numeric value to format
   * @returns Formatted currency string (e.g., "$125,000")
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Gets CSS classes for status badge based on quote stage
   * 
   * @returns Tailwind CSS class string for badge styling
   */
  const getBadgeColor = () => {
    switch (quote.quote_stage) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  /**
   * Gets human-readable label for quote stage
   * 
   * @returns Display label for the status badge
   */
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
        {/* Header: Subject, quote number, status badge */}
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

        {/* Financial Summary Panel */}
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="shrink-0">{formatCurrency(quote.subtotal)}</span>
          </div>
          
          {/* Discount line (if applicable) */}
          {quote.discount_total && quote.discount_total > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-destructive shrink-0">
                {formatCurrency(quote.discount_total)}
              </span>
            </div>
          )}
          
          {/* Tax line (ITBMS 7%) - calculated from total - subtotal */}
          {hasTaxes && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">ITBMS:</span>
              <span className="text-blue-600 font-medium shrink-0">
                {formatCurrency(taxAmount)}
              </span>
            </div>
          )}
          
          {/* Total line */}
          <div className="flex justify-between font-medium mt-2 pt-2 border-t border-border">
            <span>Total:</span>
            <span className="text-primary shrink-0">{formatCurrency(quote.total)}</span>
          </div>
        </div>

        {/* Description Section (conditional) */}
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

        {/* Quote Items Preview (conditional) */}
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
                    {/* Product name with truncation */}
                    <p className="font-medium text-sm truncate" title={item.productname}>
                      {item.productname || 'Unnamed item'}
                    </p>
                    
                    {/* Item description with truncation (if exists) */}
                    {item.description && (
                      <p 
                        className="text-xs text-muted-foreground line-clamp-2 wrap-break-word mt-0.5"
                        title={item.description}
                      >
                        {item.description}
                      </p>
                    )}
                    
                    {/* Quantity and unit price */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} × {formatCurrency(item.listprice)}
                    </p>
                  </div>
                  {/* Item total aligned right */}
                  <span className="font-medium text-sm shrink-0">
                    {formatCurrency(item.total ?? 0)}
                  </span>
                </div>
              ))}
              {/* "+X more items" indicator */}
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

        {/* Action Buttons */}
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