import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FileText, Loader2, Plus } from 'lucide-react';
import type { VendorQuoteSummary } from '../../types/procurement';

interface Props {
    projectId: number;
    quotes: VendorQuoteSummary[];
    isLoading: boolean;
    onCreateNew: () => void;
    isCreating?: boolean;
}

const statusConfig: Record<string, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
}> = {
    draft: { label: 'Draft', variant: 'secondary' },
    sent: { label: 'Sent', variant: 'outline' },
    submitted: { label: 'Received', variant: 'default' },
    negotiated: { label: 'Negotiating', variant: 'outline' },
    accepted: {
        label: 'Accepted',
        variant: 'default',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 border-green-200'
    },
    processed: {
        label: 'Converted to PO',
        variant: 'default',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 border-green-200'
    },
    rejected: { label: 'Rejected', variant: 'destructive' },
};

/**
 * RelatedQuotesSection component for displaying vendor quotes linked to a material request.
 *
 * Features:
 * - Shows list of quotes with status badges
 * - Displays vendor information and quote total
 * - Provides link to view each quote
 * - Button to create a new RFQ
 *
 * @component
 * @param props - Component props
 * @param props.projectId - Project ID for navigation
 * @param props.mrId - Material request ID
 * @param props.quotes - Array of vendor quote summaries
 * @param props.isLoading - Whether data is loading
 * @param props.onCreateNew - Callback to create a new RFQ
 * @param props.isCreating - Whether creation is in progress
 * @returns The rendered related quotes section
 */
export const RelatedQuotesSection = ({ projectId,  quotes, isLoading, onCreateNew, isCreating }: Props) => {
    if (isLoading) return <p className="text-sm text-muted-foreground py-2">Loading quotes...</p>;

    return (
        <Card className="mt-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Linked Quotes ({quotes.length})
                </CardTitle>
                <button
                    onClick={onCreateNew}
                    disabled={isCreating}
                    className={`text-sm text-primary hover:underline flex items-center gap-1 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {isCreating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Plus className="h-3 w-3" />
                    )}
                    New RFQ
                </button>
            </CardHeader>
            <CardContent>
                {quotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No quotes have been generated for this request.</p>
                ) : (
                    <div className="space-y-3">
                        {quotes.map(q => {
                            const cfg = statusConfig[q.status] || statusConfig.draft;
                            return (
                                <div key={q.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{q.quote_number}</span>
                                            <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Vendor #{q.vendor_id} • {q.vendor_name || 'N/A'} • Created: {new Date(q.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-sm font-medium">${Number(q.total_amount).toFixed(2)}</span>
                                        <Link
                                            to={`/dashboard/projects/${projectId}/procurement/vendor-quotes/${q.id}`}
                                            className="text-primary hover:underline text-sm flex items-center gap-1"
                                        >
                                            View <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};