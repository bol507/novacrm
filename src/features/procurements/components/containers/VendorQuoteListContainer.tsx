// src/features/procurement/containers/VendorQuoteListContainer.tsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { VendorQuoteListPage } from '../presentational/VendorQuoteListPage';

export const VendorQuoteListContainer = () => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { data: quotes, isLoading } = useVendorQuotes.list(Number(projectId));
    const { mutate: acceptQuote } = useVendorQuotes.accept();

    const handleAcceptQuote = (quoteId: number) => {
        acceptQuote({ quoteId, payload: {} }, {
            onSuccess: () => {
                toast.success('Cotización aceptada exitosamente');
            },
            onError: (err) => {
                toast.error(err.message || 'Error aceptando cotización');
            },
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="space-y-6">

            {/* Header con acción */}
            <div className="flex items-center justify-start ">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8"
                    aria-label="Volver"
                    title="Volver a la lista de solicitudes"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">Cotizaciones de Proveedores</h2>
                    <p className="text-sm text-muted-foreground">
                        Solicitudes de cotización (RFQ) y respuestas de proveedores
                    </p>
                </div>

            </div>

            {/* Lista de cotizaciones */}
            <VendorQuoteListPage
                quotes={quotes?.data || []}
                isLoading={isLoading}
                onViewDetail={(quoteId) => navigate(`${quoteId}`)}
                onAccept={handleAcceptQuote}
            />


        </div>
    );
};

export default VendorQuoteListContainer;