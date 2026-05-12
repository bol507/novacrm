// src/features/procurement/components/ProjectPurchaseOrdersTab.tsx
import { PurchaseOrderListContainer } from '../containers/PurchaseOrderListContainer';

export interface ProjectPurchaseOrdersTabProps {
  /** Project ID for API calls */
  projectId: number;
}

/**
 * ProjectPurchaseOrdersTab Component
 *
 * Displays the purchase orders module content inside the project detail page.
 * Uses composition with the PurchaseOrderListContainer to handle the PO
 * listing, filtering, and detail navigation logic.
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
            Generated purchase orders for materials and services in this project
          </p>
        </div>
      </div>

      <PurchaseOrderListContainer projectId={String(projectId)} />
    </div>
  );
};