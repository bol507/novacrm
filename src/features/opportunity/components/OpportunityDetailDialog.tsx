import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    Calendar,
    Users,
    Building2,
    TrendingUp,
    CheckCircle,
    PencilIcon,
    Trash2Icon,
    XCircleIcon
} from "lucide-react";
import type { Opportunity } from "../types/opportunity";

/**
 * Props for OpportunityDetailDialog component
 */
export interface OpportunityDetailDialogProps {
    /** Opportunity object to display details for, or null if not loaded */
    opportunity: Opportunity | null;
    /** Controls dialog visibility */
    open: boolean;
    /** Callback to change dialog visibility */
    onOpenChange: (open: boolean) => void;
    /** Callback fired when edit action is triggered */
    onEdit: (opportunity: Opportunity) => void;
    /** Callback fired when delete action is triggered */
    onDelete: (opportunity: Opportunity) => void;
}

/**
 * OpportunityDetailDialog Component
 * 
 * Displays comprehensive details for a single sales opportunity in a modal dialog.
 * Shows opportunity name, ID, stage badge, financial metrics, client/assignee info,
 * closing date, description, and status-specific banners for won/lost opportunities.
 * Includes edit and delete action buttons.
 * 
 * @component
 * @param {OpportunityDetailDialogProps} props - Component props
 * @param {Opportunity | null} props.opportunity - Opportunity data to display
 * @param {boolean} props.open - Dialog visibility state
 * @param {function} props.onOpenChange - Callback to toggle dialog visibility
 * @param {function} props.onEdit - Edit action callback with opportunity object
 * @param {function} props.onDelete - Delete action callback with opportunity object
 * 
 * @returns {JSX.Element|null} Opportunity detail dialog or null if no opportunity
 * 
 * @example
 * // Basic usage with opportunity data
 * <OpportunityDetailDialog 
 *   opportunity={selectedOpportunity}
 *   open={isDialogOpen}
 *   onOpenChange={setIsDialogOpen}
 *   onEdit={handleEditOpportunity}
 *   onDelete={handleDeleteOpportunity}
 * />
 * 
 * @remarks
 * - Returns null if opportunity is null (prevents rendering empty dialog)
 * - Currency values formatted in USD with Panama locale (es-PA), no decimals
 * - Dates formatted with Spanish locale (es-ES) for consistency
 * - Stage badge colors follow semantic conventions: green (won), red (lost), amber (negotiation), blue (other)
 * - Opportunity number formatted as OPP-XXX with zero-padding for display consistency
 * - Won/lost opportunities display status-specific banners with icons and messaging
 * - Action buttons stop event propagation to prevent dialog close on click
 * - Dialog content is scrollable with max-height for large opportunity descriptions
 * - Component is purely presentational; all business logic handled by parent
 * 
 * @see {@link Opportunity} for opportunity data structure
 * @see {@link getStageColor} for stage badge color mapping
 * @see {@link formatCurrency} for currency formatting utility
 */
const OpportunityDetailDialog = ({
    opportunity,
    open,
    onOpenChange,
    onEdit,
    onDelete
}: OpportunityDetailDialogProps) => {
    /**
     * Early return if no opportunity data available
     * Prevents rendering dialog with null/undefined content
     */
    if (!opportunity) return null;

    /**
     * Formats a numeric value as USD currency
     * 
     * Uses Panama Spanish locale (es-PA) with no decimal places
     * for consistent dashboard presentation. Handles null/undefined gracefully.
     * 
     * @param value - Numeric value to format, or null/undefined
     * @returns Formatted currency string (e.g., "$125,000") or "$0" for empty values
     * 
     * @example
     * formatCurrency(125000) // returns "$125,000"
     * formatCurrency(0) // returns "$0"
     * formatCurrency(null) // returns "$0"
     * formatCurrency(undefined) // returns "$0"
     */
    const formatCurrency = (value: number | null | undefined): string => {
        if (!value && value !== 0) return '$0';
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    /**
     * Formats a date string for display
     * 
     * Uses Spanish locale (es-ES) with default date formatting.
     * Returns dash placeholder for null/empty values.
     * 
     * @param dateString - ISO date string or null
     * @returns Formatted date string (e.g., "24/2/2026") or "-" if null
     * 
     * @example
     * formatDate("2026-02-24") // returns "24/2/2026"
     * formatDate(null) // returns "-"
     */
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    /**
     * Gets CSS classes for stage badge styling based on opportunity stage
     * 
     * Maps sales stages to semantic color schemes for visual clarity:
     * - Closed Won: green (success)
     * - Closed Lost: red (error)
     * - Proposal/Negotiation: amber (warning)
     * - All other stages: blue (info)
     * 
     * @param stage - Opportunity sales stage string
     * @returns Tailwind CSS class string for badge styling
     * 
     * @example
     * getStageColor('Closed Won') // returns green classes
     * getStageColor('Prospecting') // returns blue classes
     */
    const getStageColor = (stage: string): string => {
        switch (stage) {
            case 'Closed Won':
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case 'Closed Lost':
                return "bg-destructive/10 text-destructive border-destructive/20";
            case 'Proposal/Price Quote':
            case 'Negotiation/Review':
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            default:
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        }
    };

    /**
     * Formats opportunity ID as human-readable opportunity number
     * 
     * Converts numeric ID to format OPP-XXX with zero-padding for consistency.
     * 
     * @param id - Numeric opportunity ID
     * @returns Formatted opportunity number string (e.g., "OPP-042")
     * 
     * @example
     * formatOpportunityNumber(42) // returns "OPP-042"
     * formatOpportunityNumber(1234) // returns "OPP-1234"
     */
    const formatOpportunityNumber = (id: number): string => {
        return `OPP-${String(id).padStart(3, '0')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
                <DialogHeader>
                    {/* Header: Title, opportunity number, and stage badge */}
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">
                                {opportunity.potentialname}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {formatOpportunityNumber(opportunity.potentialid)}
                            </p>
                        </div>
                        <Badge variant="outline" className={getStageColor(opportunity.sales_stage)}>
                            {opportunity.sales_stage}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Financial Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Estimated Value Card */}
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Estimated value</span>
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(opportunity.amount)}</div>
                    </div>

                    {/* Probability Card */}
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Probability</span>
                        </div>
                        <div className={`text-2xl font-bold ${opportunity.probability ? 'text-amber-600' : 'text-gray-500'}`}>
                            {opportunity.probability || '-'}%
                        </div>
                    </div>
                </div>

                {/* Detail Information Sections */}
                <div className="space-y-4">
                    {/* Related Client (conditional) */}
                    {opportunity.related_to_name && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Client</p>
                                <p className="font-medium">{opportunity.related_to_name}</p>
                            </div>
                        </div>
                    )}

                    {/* Assigned User (conditional) */}
                    {opportunity.assigned_user_name && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Assigned to</p>
                                <p className="font-medium">{opportunity.assigned_user_name}</p>
                            </div>
                        </div>
                    )}

                    {/* Closing Date (conditional) */}
                    {opportunity.closingdate && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Closing date</p>
                                <p className="font-medium">{formatDate(opportunity.closingdate)}</p>
                            </div>
                        </div>
                    )}

                    {/* Description (conditional) */}
                    {opportunity.description && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                            <p className="text-sm">{opportunity.description}</p>
                        </div>
                    )}
                </div>

                {/* Status-Specific Banners */}
                
                {/* Closed Won Banner */}
                {opportunity.sales_stage === 'Closed Won' && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                            <span className="text-sm font-medium text-emerald-900">
                                Opportunity closed successfully
                            </span>
                        </div>
                    </div>
                )}

                {/* Closed Lost Banner */}
                {opportunity.sales_stage === 'Closed Lost' && (
                    <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <XCircleIcon className="h-5 w-5 text-destructive shrink-0" />
                            <span className="text-sm font-medium text-destructive">
                                Opportunity lost
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                        className="flex-1 gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(opportunity);
                        }}
                    >
                        <PencilIcon className="h-4 w-4" />
                        Edit Opportunity
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(opportunity);
                        }}
                    >
                        <Trash2Icon className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OpportunityDetailDialog;