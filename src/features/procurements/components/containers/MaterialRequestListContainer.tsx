// src/features/procurement/containers/MaterialRequestListContainer.tsx

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';

import { MaterialRequestList } from '../presentational/MaterialRequestList';
import { ApprovalModal } from '../presentational/ApprovalModal';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Clock, FileTextIcon, Plus } from 'lucide-react';
import { procurementService } from '../../services/procurement-service';
import type { ApproveRequestPayload, MaterialRequestItem } from '../../types/procurement';
import { useProcurement } from '../../hooks/useProcurement';
import { CreateMaterialRequestForm } from '../presentational/CreateMaterialRequestForm';

interface Props {
    projectId: string;
}

export const MaterialRequestListContainer = ({ projectId }: Props) => {
    const navigate = useNavigate();
    const { user, isAdmin, hasAnyHierarchicalRole, roleName } = useAuth();

    // Estados locales
    const [showForm, setShowForm] = useState(false);
    const [approvalModal, setApprovalModal] = useState<{ open: boolean; requestId?: number }>({ open: false });
    const [itemsForApproval, setItemsForApproval] = useState<MaterialRequestItem[]>([]);



    // Hooks de React Query
    const { data: requests, isLoading, refetch } = useProcurement.listRequests(Number(projectId));



    const { mutate: approveRequest, isPending: isApproving } = useProcurement.approveRequest();



    // Permisos
    const canApprove =
        isAdmin ||
        hasAnyHierarchicalRole(['H2', 'H5', 'H8']) ||
        roleName === 'Producción' ||
        roleName === 'Compras' ||
        roleName === 'Administrador';

    // Handlers existentes
    const handleApprove = (requestId: number) => {
        setApprovalModal({ open: true, requestId });
    };

    const handleApprovalSubmit = (payload: ApproveRequestPayload) => {
        if (!approvalModal.requestId) return;
        approveRequest(
            { projectId: Number(projectId), requestId: approvalModal.requestId, payload },
            {
                onSuccess: () => { toast.success('Request processed'); setApprovalModal({ open: false }); refetch(); },
                onError: (err) => toast.error(err.message || 'Error'),
            }
        );
    };



    // Cargar ítems para aprobación
    const loadRequestItems = async (requestId: number) => {
        try {
            const response = await procurementService.getRequest(Number(projectId), requestId);
            setItemsForApproval(response.data.data?.items || []);
        } catch (error) {
            console.error('Error loading request items:', error);
            setItemsForApproval([]);
        }
    };

    useEffect(() => {
        if (approvalModal.open && approvalModal.requestId) {
            loadRequestItems(approvalModal.requestId);
        } else {
            setItemsForApproval([]);
        }
    }, [approvalModal.open, approvalModal.requestId]);


    const approvedItems = useMemo(() => {
        return (requests?.data || []).flatMap(req =>
            (req.items || []).filter(item => {
                const status = String(item.item_status || '').toLowerCase().trim();
                return ['approved', 'partially_approved'].includes(status);
            })
        );
    }, [requests]);

    const hasAnyCreateable = useMemo(() => {
        if (approvedItems.length === 0) return false;
        const requestIds = [...new Set(approvedItems.map(i => i.request_id))];
        return requestIds.some(reqId => {
            const request = requests?.data?.find(r => r.id === reqId);
            return request &&
                ['approved', 'partially_approved'].includes(request.status) &&
                request.status !== 'procurement_in_progress';
        });
    }, [approvedItems, requests]);

    const hasAnyInProgress = useMemo(() => {
        if (approvedItems.length === 0) return false;
        const requestIds = [...new Set(approvedItems.map(i => i.request_id))];
        return requestIds.some(reqId => {
            const request = requests?.data?.find(r => r.id === reqId);
            return request?.status === 'procurement_in_progress';
        });
    }, [approvedItems, requests]);

    const handleCreateRFQ = () => {
        if (approvedItems.length === 0) {
            toast.info('No hay ítems aprobados para cotizar');
            return;
        }

        // Agrupar por request_id
        const groupedByRequest = new Map<number, MaterialRequestItem[]>();
        approvedItems.forEach(item => {
            const reqId = item.request_id;
            const existing = groupedByRequest.get(reqId) || [];
            groupedByRequest.set(reqId, [...existing, item]);
        });

        // ✅ Convertir keys a array y tomar el primero (más legible)
        const requestIds = Array.from(groupedByRequest.keys());
        const firstReqId = requestIds[0];

        // ✅ Validación temprana (TypeScript infiere que firstReqId es number después del if)
        if (!firstReqId) {
            toast.error('No se pudo identificar la solicitud para crear la RFQ');
            return;
        }

        const itemsForRFQ = groupedByRequest.get(firstReqId) || [];
        if (itemsForRFQ.length === 0) {
            toast.error('No hay ítems válidos para cotizar');
            return;
        }

        // ✅ Navegar a la página de creación de RFQ con state
        navigate(`/dashboard/projects/${projectId}/procurement/create-rfq`, {
            state: {
                materialRequestId: firstReqId,
                items: itemsForRFQ,
            },
        });
    };

    /*const hasActiveRFQ = (requestId: number) => {
        // Opción A: Si tu backend retorna `has_active_rfq` en la respuesta
        const request = requests?.data?.find(r => r.id === requestId);
        //return request?.has_active_rfq === true;

        // Opción B: Si necesitas verificarlo por estado
        return request?.status === 'procurement_in_progress';
    };*/


    if (!user) return null;

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                    <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">Material Management</h2>
                    <p className="text-sm text-muted-foreground">Project #{projectId}</p>
                </div>

                {/* Botón Nueva Solicitud */}
                {!showForm && approvedItems.length === 0 && (
                    <Button onClick={() => setShowForm(true)} variant="default" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Request
                    </Button>
                )}

                {approvedItems.length > 0 && (
                    <div className="flex gap-2">

                        {/* Botón Crear RFQ: Solo si hay ítems createables */}
                        {hasAnyCreateable && (
                            <Button onClick={handleCreateRFQ} variant="default" size="sm" className="gap-2">
                                <FileTextIcon className="h-4 w-4" />
                                Crear RFQ ({approvedItems.length})
                            </Button>
                        )}

                        {/* Botón Ver Cotizaciones: Solo si hay ítems en progreso */}
                        {hasAnyInProgress && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                    // Navegar al primer request en progreso encontrado
                                    const inProgressReqId = approvedItems.find(item => {
                                        const req = requests?.data?.find(r => r.id === item.request_id);
                                        return req?.status === 'procurement_in_progress';
                                    })?.request_id;

                                    if (inProgressReqId) {
                                        navigate(`/dashboard/projects/${projectId}/procurement/vendor-quotes?request_id=${inProgressReqId}`);
                                    }
                                }}
                            >
                                <FileTextIcon className="h-4 w-4" />
                                Ver Cotizaciones
                            </Button>
                        )}

                        {/* Fallback informativo si no hay ninguna acción disponible */}
                        {!hasAnyCreateable && !hasAnyInProgress && approvedItems.length > 0 && (
                            <Button variant="outline" size="sm" className="gap-2" disabled>
                                <Clock className="h-4 w-4" />
                                Sin acciones disponibles
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Formulario de nueva solicitud */}
            {showForm && (
                <div className="mb-6">
                    <CreateMaterialRequestForm
                        projectId={projectId}
                        onClose={() => setShowForm(false)}
                        onSuccess={() => { setShowForm(false); refetch(); }}
                    />
                </div>
            )}



            {/* Lista de solicitudes */}
            <MaterialRequestList
                requests={requests?.data || []}
                isLoading={isLoading}
                onNewRequest={() => setShowForm(true)}
                onViewDetails={(id) => navigate(`/dashboard/projects/${projectId}/procurement/${id}`)}
                onApprove={handleApprove}
                canApprove={canApprove}
                onViewQuotes={(requestId) =>
                    navigate(`/dashboard/projects/${projectId}/procurement/vendor-quotes?request_id=${requestId}`)
                }
            />

            {/* Modal de aprobación */}
            {approvalModal.open && approvalModal.requestId && (
                <ApprovalModal
                    open
                    requestId={approvalModal.requestId}
                    items={itemsForApproval}
                    onClose={() => setApprovalModal({ open: false })}
                    onSubmit={handleApprovalSubmit}
                    isPending={isApproving}
                />
            )}


        </>
    );
};