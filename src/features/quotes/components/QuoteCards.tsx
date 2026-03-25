import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Quote } from "../types/quote";
import { QuoteCard } from "./QuoteCard";
import { FileText } from "lucide-react";

interface QuoteCardsProps {
  /** Array of quotes to display */
  quotes: Quote[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Callback for editing a quote */
  onEditQuote?: (quote: Quote) => void;
  /** Callback for deleting a quote */
  onDeleteQuote?: (quote: Quote) => void;
}

/**
 * QuoteCards component for displaying quotes in a responsive card grid.
 *
 * Features:
 * - Skeleton loading state with animated placeholders
 * - Empty state with helpful message and icon
 * - Responsive grid layout (1 column on mobile, up to 4 on large screens)
 * - Delegates individual quote rendering to QuoteCard component
 *
 * @component
 * @param props - Component props
 * @param props.quotes - Array of quotes to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.onEditQuote - Callback for editing a quote
 * @param props.onDeleteQuote - Callback for deleting a quote
 * @returns The rendered quote cards grid
 *
 * @example
 * // Basic usage
 * <QuoteCards
 *   quotes={quotes}
 *   isLoading={isLoading}
 *   onEditQuote={handleEditQuote}
 *   onDeleteQuote={handleDeleteQuote}
 * />
 *
 * @example
 * // Empty state
 * <QuoteCards
 *   quotes={[]}
 *   isLoading={false}
 *   onEditQuote={handleEditQuote}
 *   onDeleteQuote={handleDeleteQuote}
 * />
 */
export const QuoteCards = ({
  quotes,
  isLoading,
  onEditQuote,
  onDeleteQuote
}: QuoteCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
              <div className="h-3 bg-muted rounded w-4/6" />
              <div className="h-6 bg-primary/10 rounded w-1/3 mt-4" />
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 w-full">
                <div className="h-8 bg-muted rounded flex-1" />
                <div className="h-8 bg-muted rounded w-8" />
                <div className="h-8 bg-muted rounded w-8" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No quotes found</h3>
        <p className="text-muted-foreground">Create your first quote to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {quotes.map((quote) => (
        <QuoteCard
          key={quote.quoteid}
          quote={quote}
          onEditQuote={onEditQuote}
          onDeleteQuote={onDeleteQuote}
        />
      ))}
    </div>
  );
};