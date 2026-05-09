import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';

import { MaterialRequestList } from '../presentational/MaterialRequestList';
import { ApprovalModal } from '../presentational/ApprovalModal';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, FileTextIcon } from 'lucide-react';
import { procurementService } from '../../services/procurement-service';
import type { ApproveRequestPayload, MaterialRequestItem } from '../../types/procurement';
import { useProcurement } from '../../hooks/use-procurement';
import { CreateMaterialRequestForm } from '../presentational/CreateMaterialRequestForm';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';

interface Props {
    projectId: string;
}

/**
 * MaterialRequestListContainer component for managing material requests.
 *
 * Features:
 * - Fetches and displays material requests for a project
 * - Handles creation of new material requests
 * - Manages approval workflow for requests
 * - Generates RFQs (Request for Quotations) from approved items
 * - Role-based permission checking for approvals
 * - Displays view quotes button when RFQs are in progress or quotes exist
 *
 * @component
 * @param props - Component props
 * @param props.projectId - ID of the project
 * @returns The rendered material request list container
 */
export const MaterialRequestListContainer = ({ projectId }: Props) => {
    const navigate = useNavigate();
    const { user, isAdmin, hasAnyHierarchicalRole, roleName } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [approvalModal, setApprovalModal] = useState<{ open: boolean; requestId?: number }>({ open: false });
    const [itemsForApproval, setItemsForApproval] = useState<MaterialRequestItem[]>([]);

    const { data: requests, isLoading, refetch } = useProcurement.listRequests(Number(projectId));
    const { mutate: approveRequest, isPending: isApproving } = useProcurement.approveRequest();
    const { data: quotes } = useVendorQuotes.list(Number(projectId));

    const canApprove =
        isAdmin ||
        hasAnyHierarchicalRole(['H2', 'H5', 'H8']) ||
        roleName === 'Producción' ||
        roleName === 'Compras' ||
        roleName === 'Administrador';

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

    const hasAnyInProgress = useMemo(() => {
        if (approvedItems.length === 0) return false;
        const requestIds = [...new Set(approvedItems.map(i => i.request_id))];
        return requestIds.some(reqId => {
            const request = requests?.data?.find(r => r.id === reqId);
            return request?.status === 'procurement_in_progress';
        });
    }, [approvedItems, requests]);

    const hasAnyQuotes = useMemo(() => {
        if (approvedItems.length === 0 || !quotes?.data) return false;

        const requestIds = [...new Set(approvedItems.map(i => i.request_id))];

        return quotes.data.some((quote: any) =>
            requestIds.includes(quote.material_request_id)
        );
    }, [approvedItems, quotes]);

    const handleCreateRFQForRequest = (requestId: number, items: MaterialRequestItem[]) => {
        if (items.length === 0) {
            toast.info('No approved items in this request to quote');
            return;
        }

        navigate(`/dashboard/projects/${projectId}/procurement/create-rfq`, {
            state: {
                materialRequestId: requestId,
                items: items,
            },
        });
    };

    if (!user) return null;

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                    <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">Material Management</h2>
                    <p className="text-sm text-muted-foreground">Project #{projectId}</p>
                </div>

                {approvedItems.length > 0 && (
                    <div className="flex gap-2">
                        {(hasAnyInProgress || hasAnyQuotes) && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                    const inProgressReqId = approvedItems.find(item => {
                                        const req = requests?.data?.find(r => r.id === item.request_id);
                                        return req?.status === 'procurement_in_progress';
                                    })?.request_id;

                                    const targetReqId = inProgressReqId || approvedItems[0]?.request_id;

                                    if (targetReqId) {
                                        navigate(`/dashboard/projects/${projectId}/procurement/vendor-quotes?request_id=${targetReqId}`);
                                    }
                                }}
                            >
                                <FileTextIcon className="h-4 w-4" />
                                View Quotes
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="mb-6">
                    <CreateMaterialRequestForm
                        projectId={projectId}
                        onClose={() => setShowForm(false)}
                        onSuccess={() => { setShowForm(false); refetch(); }}
                    />
                </div>
            )}

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
                onCreateRFQ={handleCreateRFQForRequest}
            />

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