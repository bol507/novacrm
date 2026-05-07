// src/features/procurement/containers/MaterialRequestDetailContainer.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { ProjectErrorState } from '@/features/projects/components/ProjectDetail';
import { ProjectPageLoader } from '@/features/projects/components/ProjectPageLoader';
import MaterialRequestDetailPage from '../presentational/MaterialRequestDetailPage';
import { useProcurement } from '../../hooks/use-procurement';

export const MaterialRequestDetailContainer = () => {
  const { projectId, requestId } = useParams<{ projectId: string; requestId: string }>();
  const navigate = useNavigate();

  const {  data: request, isLoading, error } = useProcurement.getRequest(
    Number(projectId),
    Number(requestId)
  );

  if (isLoading) return <ProjectPageLoader />;
  if (error || !request) {
    return (
      <ProjectErrorState 
        message="Solicitud no encontrada" 
        onBack={() => navigate(-1)} 
      />
    );
  }

  return <MaterialRequestDetailPage request={request.data} onBack={() => navigate(-1)} />;
};

export default MaterialRequestDetailContainer;