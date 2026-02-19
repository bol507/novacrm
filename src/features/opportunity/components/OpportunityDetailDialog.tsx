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

interface OpportunityDetailDialogProps {
    opportunity: Opportunity | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (opportunity: Opportunity) => void;
    onDelete: (opportunity: Opportunity) => void;
}

const OpportunityDetailDialog = ({
    opportunity,
    open,
    onOpenChange,
    onEdit,
    onDelete
}: OpportunityDetailDialogProps) => {
    if (!opportunity) return null;

    // Formateadores
    const formatCurrency = (value: number | null | undefined): string => {
        if (!value && value !== 0) return '$0';
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

    const getProbabilityColor = (probability: number | null | undefined): string => {
        if (probability === null || probability === undefined) return "bg-gray-100 text-gray-600";
        if (probability >= 70) return "bg-green-500/10 text-green-600 border-green-500/20";
        if (probability >= 30) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
        return "bg-red-500/10 text-red-600 border-red-500/20";
    };

    const formatOpportunityNumber = (id: number): string => {
        return `OPP-${String(id).padStart(3, '0')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
                <DialogHeader>
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


                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Valor estimado</span>
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(opportunity.amount)}</div>
                    </div>

                    <div className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Probabilidad</span>
                        </div>
                        <div className={`text-2xl font-bold ${opportunity.probability ? 'text-amber-600' : 'text-gray-500'}`}>
                            {opportunity.probability || '-'}%
                        </div>
                    </div>
                </div>


                <div className="space-y-4">
                    {/* Cliente */}
                    {opportunity.related_to_name && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                <p className="font-medium">{opportunity.related_to_name}</p>
                            </div>
                        </div>
                    )}


                    {opportunity.assigned_user_name && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                                <p className="font-medium">{opportunity.assigned_user_name}</p>
                            </div>
                        </div>
                    )}


                    {opportunity.closingdate && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Fecha de cierre</p>
                                <p className="font-medium">{formatDate(opportunity.closingdate)}</p>
                            </div>
                        </div>
                    )}


                    {opportunity.description && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Descripción</p>
                            <p className="text-sm">{opportunity.description}</p>
                        </div>
                    )}
                </div>


                {opportunity.sales_stage === 'Closed Won' && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-emerald-900">
                                Oportunidad cerrada exitosamente
                            </span>
                        </div>
                    </div>
                )}

                {opportunity.sales_stage === 'Closed Lost' && (
                    <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <XCircleIcon className="h-5 w-5 text-destructive flex-shrink-0" />
                            <span className="text-sm font-medium text-destructive">
                                Oportunidad perdida
                            </span>
                        </div>
                    </div>
                )}


                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                        className="flex-1 gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(opportunity);
                        }}
                    >
                        <PencilIcon className="h-4 w-4" />
                        Editar Oportunidad
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
                        Eliminar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OpportunityDetailDialog;