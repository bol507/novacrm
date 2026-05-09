import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Calendar, CheckCircle2, FileText, Send, MessageSquare, Package } from 'lucide-react';
import type { VendorQuote } from '../../types/procurement';
import { type JSX } from 'react';

interface Props {
    quote: VendorQuote;
    onBack: () => void;
    onAccept: () => void;
    onSend: () => void;
    onNegotiate: () => void;
    onGeneratePO: () => void;
    isSending: boolean;
    isAccepting: boolean;
    isNegotiating: boolean;
}

/**
 * VendorQuoteDetailPage component for displaying vendor quote details.
 *
 * Features:
 * - Displays quote header with status badge
 * - Shows quote details (validity, terms, notes)
 * - Provides action buttons based on quote status (send, accept, negotiate, generate PO)
 * - Displays items table with quantities, pricing, and totals
 * - Sticky footer with quote total
 *
 * @component
 * @param props - Component props
 * @param props.quote - Vendor quote data
 * @param props.onBack - Callback when back button is clicked
 * @param props.onAccept - Callback when accept button is clicked
 * @param props.onSend - Callback when send button is clicked
 * @param props.onNegotiate - Callback when negotiate button is clicked
 * @param props.onGeneratePO - Callback when generate PO button is clicked
 * @param props.isSending - Whether send operation is in progress
 * @param props.isAccepting - Whether accept operation is in progress
 * @param props.isNegotiating - Whether negotiate operation is in progress
 * @returns The rendered vendor quote detail page
 */
export const VendorQuoteDetailPage = ({
    quote, onBack, onAccept, onSend, onNegotiate, onGeneratePO,
    isSending, isAccepting, isNegotiating
}: Props) => {

    const getStatusBadge = (status: VendorQuote['status']) => {
        const base = 'text-xs font-medium';
        const map: Record<string, JSX.Element> = {
            draft: <Badge className={`${base} bg-gray-100 text-gray-800`}>Draft</Badge>,
            sent: <Badge className={`${base} bg-blue-100 text-blue-800`}>Sent</Badge>,
            submitted: <Badge className={`${base} bg-indigo-100 text-indigo-800`}>Received</Badge>,
            negotiated: <Badge className={`${base} bg-orange-100 text-orange-800`}>Negotiating</Badge>,
            accepted: <Badge className={`${base} bg-green-100 text-green-800 flex items-center gap-1`}><CheckCircle2 className="h-3 w-3" /> Accepted</Badge>,
            rejected: <Badge className={`${base} bg-red-100 text-red-800`}>Rejected</Badge>,
        };
        return map[status] || <Badge variant="outline">{status}</Badge>;
    };

    const totalItems = quote.items?.reduce((sum, i) => sum + Number(i.line_total), 0) ?? Number(quote.total_amount);

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
                            <div>
                                <h1 className="text-lg font-semibold">Quote #{quote.quote_number}</h1>
                                <p className="text-sm text-muted-foreground">Project #{quote.project_id} • Vendor: {quote.vendor_name || `#${quote.vendor_id}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">{getStatusBadge(quote.status)}</div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Valid until</p>
                                    <p className="font-medium">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '—'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Terms</p>
                                <p className="whitespace-pre-wrap text-muted-foreground">{quote.terms || 'No terms specified'}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Internal notes</p>
                                <p className="whitespace-pre-wrap text-muted-foreground">{quote.notes || 'No notes'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {quote.status === 'draft' && (
                                <Button onClick={onSend} disabled={isSending} className="w-full gap-2">
                                    <Send className="h-4 w-4" />
                                    Send to Vendor
                                </Button>
                            )}

                            {(quote.status === 'submitted' || quote.status === 'negotiated') && (
                                <Button onClick={onAccept} variant="default" disabled={isAccepting} className="w-full gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {isAccepting ? 'Accepting...' : 'Accept Quote'}
                                </Button>
                            )}

                            {(quote.status === 'sent' || quote.status === 'submitted') && (
                                <Button onClick={onNegotiate} variant="outline" disabled={isNegotiating} className="w-full gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Start Negotiation
                                </Button>
                            )}

                            {quote.status === 'accepted' && onGeneratePO && (
                                <Button onClick={onGeneratePO} variant="default" className="w-full gap-2 bg-green-600 hover:bg-green-700">
                                    <Package className="h-4 w-4" />
                                    Generate Purchase Order
                                </Button>
                            )}

                            {quote.status === 'accepted' && (
                                <Button variant="secondary" disabled className="w-full cursor-not-allowed opacity-70">
                                    Accepted - Ready for PO
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Quoted Items</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right hidden sm:table-cell">Disc. %</TableHead>
                                            <TableHead className="text-right hidden md:table-cell">Delivery</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quote.items?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.item_name || `Item #${item.material_request_item_id}`}</TableCell>
                                                <TableCell className="text-center font-mono">{item.quantity} {item.unit}</TableCell>
                                                <TableCell className="text-right font-mono">${Number(item.unit_price ?? 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-right hidden sm:table-cell font-mono">{item.discount_percent}%</TableCell>
                                                <TableCell className="text-right hidden md:table-cell text-sm">{item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : '—'}</TableCell>
                                                <TableCell className="text-right font-mono font-medium">${Number(item.line_total ?? 0).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={5} className="text-right font-bold">Quote Total</TableCell>
                                            <TableCell className="text-right font-bold text-lg">${Number(totalItems ?? 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
                <div className="max-w-6xl mx-auto px-4 py-4.5 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Created on {new Date(quote.created_at).toLocaleDateString()}</p>
                    <p className="text-lg font-bold text-primary">Total: ${Number(totalItems ?? 0).toFixed(2)}</p>
                </div>
            </footer>
        </div>
    );
};