// src/features/procurement/containers/EditMaterialRequestContainer.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { ProjectErrorState } from '@/features/projects/components/ProjectDetail';
import { ProjectPageLoader } from '@/features/projects/components/ProjectPageLoader';
import { EditMaterialRequestPage } from '../presentational/EditMaterialRequestPage';
import { useProcurement } from '../../hooks/use-procurement';
import { useAuth } from '@/features/auth/hooks/use-auth';

export const EditMaterialRequestContainer = () => {
    const { projectId, requestId } = useParams<{ projectId: string; requestId: string }>();
    const navigate = useNavigate();
    const { user, isAdmin, hasAnyHierarchicalRole, roleName } = useAuth();
    const isAuthLoading = !user && roleName === null && !isAdmin;
    const { data: request, isLoading, error } = useProcurement.getRequest(
        Number(projectId),
        Number(requestId)
    );

    if (isAuthLoading) {
        return <ProjectPageLoader />;
    }

    // Verificar permisos
    const canEdit =
        isAdmin ||
        hasAnyHierarchicalRole(['H2', 'H5', 'H8']) ||
        ['Producción', 'Compras', 'Administrador', 'CEO', 'Project Manager'].includes(roleName || '');

    // Verificar que la MR esté en estado editable
    const isEditable = request?.data?.status && ['draft', 'submitted'].includes(request.data.status);

    const handleSave = () => {
        navigate(`/dashboard/projects/${projectId}/procurement/${requestId}`);
    };

    const handleCancel = () => {
        navigate(`/dashboard/projects/${projectId}/procurement/${requestId}`);
    };

    if (!canEdit) {
        return (
            <ProjectErrorState
                message="You don't have permission to edit this request"
                onBack={() => navigate(-1)}
            />
        );
    }

    if (isLoading) return <ProjectPageLoader />;
    if (error || !request?.data) {
        return (
            <ProjectErrorState
                message="Material Request not found"
                onBack={() => navigate(-1)}
            />
        );
    }

    if (!isEditable) {
        return (
            <ProjectErrorState
                message={`Cannot edit request with status: ${request.data.status}`}
                onBack={() => navigate(-1)}
            />
        );
    }

    return (
        <EditMaterialRequestPage
            projectId={projectId!}
            requestId={Number(requestId)}
            requestNumber={`MR-${request.data.id}`}
            initialItems={request.data.items || []}
            onSave={handleSave}
            onCancel={handleCancel}
        />
    );
};

export default EditMaterialRequestContainer;