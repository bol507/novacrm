// src/features/procurement/containers/PurchaseOrderListContainer.tsx

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProcurement } from '../../hooks/useProcurement';
import { ProjectPageLoader } from '@/features/projects/components/ProjectPageLoader';
import { ProjectErrorState } from '@/features/projects/components/ProjectDetail';
import { PurchaseOrderListPage } from '../../pages/PurchaseOrderListPage';

interface Props {
  projectId: string;
}

export const PurchaseOrderListContainer = ({ projectId }: Props) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Paginación controlada por URL (best practice)
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);

  const {  data: pos, isLoading, error } = useProcurement.listPOs(Number(projectId), { page, limit });

  if (isLoading) return <ProjectPageLoader />;
  if (error || !pos) {
    return (
      <ProjectErrorState 
        message="No se pudieron cargar las órdenes de compra" 
        onBack={() => navigate(-1)} 
      />
    );
  }

  // Manejo de paginación
  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  return (
    <PurchaseOrderListPage
      orders={pos.data || []}
      //meta={pos.meta}
      isLoading={false}
      //currentPage={page}
      //onPageChange={handlePageChange}
      onViewDetail={(poId) => navigate(`${poId}`)}
    />
  );
};

export default PurchaseOrderListContainer;