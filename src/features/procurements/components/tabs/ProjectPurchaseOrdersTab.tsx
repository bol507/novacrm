import PurchaseOrderListContainer from "../containers/PurchaseOrderListContainer";


interface ProjectPurchaseOrdersTabProps {
  projectId: number | string;
}

/**
 * ProjectPurchaseOrdersTab Component
 *
 * Displays the purchase orders module content inside the project detail page.
 * Uses composition with the PurchaseOrderListContainer to handle the procurement
 * logic and UI for viewing, tracking, and managing purchase orders.
 *
 * @component
 * @param props - Component props
 * @param props.projectId - Project ID for API calls
 * @returns Purchase Orders tab content
 */
export const ProjectPurchaseOrdersTab = ({ projectId }: ProjectPurchaseOrdersTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h3 className="text-lg font-semibold">Purchase Orders</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage purchase orders generated for this project
          </p>
        </div>
        {/* Espacio reservado para acciones futuras: filtrar por estado, exportar, etc. */}
      </div>

      <PurchaseOrderListContainer projectId={String(projectId)} />
    </div>
  );
};

export default ProjectPurchaseOrdersTab;