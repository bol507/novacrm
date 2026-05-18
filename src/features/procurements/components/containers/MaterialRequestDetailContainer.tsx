import { useParams, useNavigate } from 'react-router-dom';
import { ProjectErrorState } from '@/features/projects/components/ProjectDetail';
import { ProjectPageLoader } from '@/features/projects/components/ProjectPageLoader';
import MaterialRequestDetailPage from '../presentational/MaterialRequestDetailPage';
import { useProcurement } from '../../hooks/use-procurement';
import type { ApproveRequestPayload } from '../../types/procurement';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ApprovalModal } from '../presentational/ApprovalModal';
import { useMaterialRequestExport } from '../../hooks/use-material-request-export';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { RelatedQuotesSection } from '../presentational/RelatedQuotesSection';

/**
 * MaterialRequestDetailContainer component for displaying a single material request.
 *
 * Features:
 * - Fetches material request data by ID from URL parameters
 * - Shows loading state while fetching
 * - Displays error state when request not found
 * - Renders the presentational detail page with request data
 * - Handles approval workflow with modal
 * - Shows related vendor quotes section
 * - Allows Excel export of request data
 *
 * @component
 * @returns The rendered material request detail container
 */
export const MaterialRequestDetailContainer = () => {
  const { projectId, requestId } = useParams<{ projectId: string; requestId: string }>();
  const navigate = useNavigate();

  const { data: request, isLoading, error } = useProcurement.getRequest(
    Number(projectId),
    Number(requestId)
  );
  const { data: relatedQuotes, isLoading: isLoadingQuotes } = useVendorQuotes.listByMR(Number(projectId), Number(requestId));
  const { user, isAdmin, hasAnyHierarchicalRole, roleName } = useAuth();
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; requestId?: number }>({ open: false });
  const { mutate: approveRequest, isPending: isApproving } = useProcurement.approveRequest();
  const { exportToExcel } = useMaterialRequestExport();

  const canApprove =
    isAdmin ||
    hasAnyHierarchicalRole(['H2', 'H5', 'H8']) ||
    roleName === 'CEO' ||
    roleName === 'Administrador' ;

  const canEdit = 
    canApprove && 
    request?.data?.status && 
    ['draft', 'submitted'].includes(request.data.status);

  const handleApprove = () => {
    if (!request?.data?.id) return;
    setApprovalModal({ open: true, requestId: request.data.id });
  };

  const handleApprovalSubmit = (payload: ApproveRequestPayload) => {
    if (!approvalModal.requestId) return;
    approveRequest(
      { projectId: Number(projectId), requestId: approvalModal.requestId, payload },
      {
        onSuccess: () => { toast.success('Request processed'); setApprovalModal({ open: false }); },
        onError: (err) => toast.error(err.message || 'Error'),
      }
    );
  };

  const handleExportExcel = () => {
    if (!request?.data) return;
    exportToExcel(request.data, request.data.items || []);
  };

  const handleCreateNewQuote = () => {
    if (!request?.data) {
      toast.error('Could not load request data');
      return;
    }

    navigate(`/dashboard/projects/${projectId}/procurement/create-rfq`, {
      state: {
        materialRequestId: request.data.id,
        requestNumber: `MR-${request.data.id}`,
        items: request.data.items?.filter(i =>
          ['approved', 'partially_approved'].includes(i.item_status)
        ) || [],
      },
    });
  };

  useEffect(() => {
  console.log('🔍 Auth debug:', { 
    isAdmin, 
    roleName, 
    hasHierarchical: hasAnyHierarchicalRole(['H2', 'H5', 'H8']) 
  });
}, [isAdmin, roleName]);

 

  if (!user) return null;
  if (isLoading) return <ProjectPageLoader />;
  if (error || !request) {
    return (
      <ProjectErrorState
        message="Request not found"
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <MaterialRequestDetailPage
        request={request.data}
        onBack={() => navigate(-1)}
        canApprove={canApprove}
        onApprove={handleApprove}
        onExportExcel={handleExportExcel}
        canEdit={canEdit}
      />

      <RelatedQuotesSection
        projectId={Number(projectId)}
        quotes={relatedQuotes || []}
        isLoading={isLoadingQuotes}
        onCreateNew={handleCreateNewQuote}
        isCreating={false}
      />

      

      {approvalModal.open && approvalModal.requestId && (
        <ApprovalModal
          open
          requestId={approvalModal.requestId}
          items={request.data.items || []}
          onClose={() => setApprovalModal({ open: false })}
          onSubmit={handleApprovalSubmit}
          isPending={isApproving}
        />
      )}
    </ErrorBoundary>
  );
};

export default MaterialRequestDetailContainer;