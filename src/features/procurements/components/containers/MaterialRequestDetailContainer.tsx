import { useParams, useNavigate } from 'react-router-dom';
import { ProjectErrorState } from '@/features/projects/components/ProjectDetail';
import { ProjectPageLoader } from '@/features/projects/components/ProjectPageLoader';
import MaterialRequestDetailPage from '../presentational/MaterialRequestDetailPage';
import { useProcurement } from '../../hooks/use-procurement';
import type { ApproveRequestPayload } from '../../types/procurement';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ApprovalModal } from '../presentational/ApprovalModal';

/**
 * MaterialRequestDetailContainer component for displaying a single material request.
 *
 * Features:
 * - Fetches material request data by ID from URL parameters
 * - Shows loading state while fetching
 * - Displays error state when request not found
 * - Renders the presentational detail page with request data
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
  const { user, isAdmin, hasAnyHierarchicalRole, roleName } = useAuth();
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; requestId?: number }>({ open: false });
  const { mutate: approveRequest, isPending: isApproving } = useProcurement.approveRequest();

  const canApprove =
    isAdmin ||
    hasAnyHierarchicalRole(['H2', 'H5', 'H8']) ||
    roleName === 'Producción' ||
    roleName === 'Compras' ||
    roleName === 'Administrador';

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
      />;

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