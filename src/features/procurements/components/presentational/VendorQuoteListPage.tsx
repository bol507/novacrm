import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import type { VendorQuote } from '../../types/procurement';

interface Props {
  quotes: VendorQuote[];
  isLoading: boolean;
  onViewDetail: (quoteId: number) => void;
  onAccept?: (quoteId: number) => void;
}

/**
 * VendorQuoteListPage component for displaying a paginated list of vendor quotes.
 *
 * Features:
 * - Table view with quote number, vendor, status, validity date, and total amount
 * - Status badges with appropriate colors and icons
 * - View detail action for all quotes
 * - Accept action for submitted quotes
 *
 * @component
 * @param props - Component props
 * @param props.quotes - Array of vendor quotes
 * @param props.isLoading - Whether data is currently loading
 * @param props.onViewDetail - Callback to view quote details
 * @param props.onAccept - Optional callback to accept a quote
 * @returns The rendered vendor quote list page
 */
export const VendorQuoteListPage = ({ quotes, isLoading, onViewDetail, onAccept }: Props) => {

  const getStatusBadge = (status: VendorQuote['status']) => {
    const base = 'text-xs font-medium';
    switch (status) {
      case 'draft':
        return <Badge className={`${base} bg-gray-100 text-gray-800`}>Draft</Badge>;
      case 'sent':
        return <Badge className={`${base} bg-blue-100 text-blue-800`}>Sent</Badge>;
      case 'submitted':
        return <Badge className={`${base} bg-indigo-100 text-indigo-800`}>Received</Badge>;
      case 'negotiated':
        return <Badge className={`${base} bg-orange-100 text-orange-800`}>Negotiating</Badge>;
      case 'accepted':
        return <Badge className={`${base} bg-green-100 text-green-800 flex items-center gap-1`}>
          <CheckCircle2 className="h-3 w-3" /> Accepted
        </Badge>;
      case 'rejected':
        return <Badge className={`${base} bg-red-100 text-red-800 flex items-center gap-1`}>
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline" className={base}>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-4">Loading quotes...</TableCell></TableRow>
            ) : quotes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No quotes registered</TableCell></TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-mono font-medium">{quote.quote_number}</TableCell>
                  <TableCell>{quote.vendor_name || `Vendor #${quote.vendor_id}`}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>
                    {quote.valid_until ? (
                      <span className={new Date(quote.valid_until) < new Date() ? 'text-destructive' : ''}>
                        {new Date(quote.valid_until).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(quote.total_amount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onViewDetail(quote.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {quote.status === 'submitted' && onAccept && (
                        <Button variant="ghost" size="icon" className="text-green-600" onClick={() => onAccept(quote.id)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};