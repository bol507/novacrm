import { useParams, useNavigate } from 'react-router-dom';
import { ProjectErrorState } from '@/features/projects/components/ProjectDetail';
import { ProjectPageLoader } from '@/features/projects/components/ProjectPageLoader';
import MaterialRequestDetailPage from '../presentational/MaterialRequestDetailPage';
import { useProcurement } from '../../hooks/use-procurement';

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

  if (isLoading) return <ProjectPageLoader />;
  if (error || !request) {
    return (
      <ProjectErrorState 
        message="Request not found" 
        onBack={() => navigate(-1)} 
      />
    );
  }

  return <MaterialRequestDetailPage request={request.data} onBack={() => navigate(-1)} />;
};

export default MaterialRequestDetailContainer;