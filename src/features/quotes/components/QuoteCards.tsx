
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Building2, 
  Users,
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import type { Quote } from "../types/quote";
import { QuoteCard } from "./QuoteCard";

interface QuoteCardsProps {
  quotes: Quote[];
  isLoading: boolean;
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (quote: Quote) => void;
}



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
        <h3 className="text-lg font-medium text-foreground mb-2">No hay cotizaciones</h3>
        <p className="text-muted-foreground">Crea tu primera cotización para comenzar.</p>
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