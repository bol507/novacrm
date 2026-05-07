// src/features/procurement/hooks/useProcurementNotifications.ts

import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';
import  { initEcho } from '@/shared/lib/echo';

interface Props {
  projectId?: number;
  enabled?: boolean;
}

export const useProcurementNotifications = ({ projectId, enabled = true }: Props) => {
  const { user } = useAuth();
  const echoRef = useRef<ReturnType<typeof initEcho> | null>(null);

  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Inicializar Echo
    echoRef.current = initEcho(user.id, projectId);

    // Cleanup al desmontar
    return () => {
      echoRef.current?.disconnect();
      echoRef.current = null;
    };
  }, [enabled, user?.id, projectId]);

  // Helpers para mostrar notificaciones
  const notifyRequestSubmitted = (data: any) => {
    toast.info('📋 Nueva solicitud de materiales', {
      description: data.message,
      action: {
        label: 'Ver',
        onClick: () => window.location.href = `/projects/${data.project_id}/procurement`,
      },
    });
  };

  const notifyPOCreated = (data: any) => {
    toast.success('🛒 Orden de compra generada', {
      description: `OC ${data.po_number} - $${data.total_amount?.toFixed(2)}`,
      action: {
        label: 'Ver detalles',
        onClick: () => { /* navegar a detalle de PO */ },
      },
    });
  };

  return {
    notifyRequestSubmitted,
    notifyPOCreated,
    isConnected: echoRef.current !== null,
  };
};