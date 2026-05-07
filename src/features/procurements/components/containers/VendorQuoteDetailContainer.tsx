// src/features/procurement/containers/VendorQuoteDetailContainer.tsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { VendorQuoteDetailPage } from '../presentational/VendorQuoteDetailPage';

export const VendorQuoteDetailContainer = () => {
  const { projectId: projectIdStr, quoteId: quoteIdStr } = useParams<{ 
    projectId: string; 
    quoteId: string; 
  }>();
  const navigate = useNavigate();
  const projectId = Number(projectIdStr);
  const quoteId = Number(quoteIdStr);

  const { data: quote, isLoading, error } = useVendorQuotes.get(projectId, quoteId);
  const { mutate: send, isPending: isSending } = useVendorQuotes.send();
  const { mutate: accept, isPending: isAccepting } = useVendorQuotes.accept();
  const { mutate: negotiate, isPending: isNegotiating } = useVendorQuotes.negotiate();

  // Estado para modal de negociación
  const [negotiateModal, setNegotiateModal] = useState({ open: false, notes: '', terms: '' });

  const handleSend = () => {
    send(quoteId, {
      onSuccess: () => toast.success('Cotización enviada al proveedor'),
      onError: (err) => toast.error(err.message || 'Error al enviar'),
    });
  };

  const handleAccept = () => {
    accept({ quoteId, payload: {} }, {
      onSuccess: () => toast.success('Cotización aceptada exitosamente. Ya puedes generar la OC.'),
      onError: (err) => toast.error(err.message || 'Error al aceptar'),
    });
  };

  const handleNegotiate = () => {
    setNegotiateModal({ open: true, notes: '', terms: '' });
  };

  const handleNegotiateSubmit = () => {
    negotiate({ quoteId, payload: { notes: negotiateModal.notes, new_terms: negotiateModal.terms } }, {
      onSuccess: () => {
        toast.success('Cotización marcada como en negociación');
        setNegotiateModal({ open: false, notes: '', terms: '' });
      },
      onError: (err) => toast.error(err.message || 'Error al negociar'),
    });
  };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Cargando cotización...</div>;
  if (error || !quote) return <div className="p-10 text-center text-destructive">Error o cotización no encontrada</div>;

  return (
    <>
      <VendorQuoteDetailPage
        quote={quote}
        onBack={() => navigate(-1)}
        onSend={handleSend}
        onAccept={handleAccept}
        onNegotiate={handleNegotiate}
        isSending={isSending}
        isAccepting={isAccepting}
        isNegotiating={isNegotiating}
      />

      <Dialog open={negotiateModal.open} onOpenChange={(o) => !o && setNegotiateModal(prev => ({...prev, open: o}))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Iniciar Negociación</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea placeholder="Motivos de la negociación / Contrapropuesta..." value={negotiateModal.notes} onChange={e => setNegotiateModal(p => ({...p, notes: e.target.value}))} />
            <Textarea placeholder="Nuevos términos (opcional)..." value={negotiateModal.terms} onChange={e => setNegotiateModal(p => ({...p, terms: e.target.value}))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNegotiateModal(p => ({...p, open: false}))}>Cancelar</Button>
            <Button onClick={handleNegotiateSubmit} disabled={isNegotiating || !negotiateModal.notes.trim()}>Confirmar Negociación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorQuoteDetailContainer;