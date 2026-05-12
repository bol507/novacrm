import { MaterialRequestListContainer } from '../containers/MaterialRequestListContainer';

export interface ProjectProcurementTabProps {
  /** Project ID for API calls */
  projectId: number;
}

/**
 * ProjectProcurementTab Component
 *
 * Displays the procurement module content inside the project detail page.
 * Uses composition with the MaterialRequestListContainer to handle the procurement
 * logic and UI for material requests, approvals, and purchase orders.
 *
 * @component
 * @param props - Component props
 * @param props.projectId - Project ID for API calls
 * @returns Procurement tab content
 */
export const ProjectProcurementTab = ({ projectId }: ProjectProcurementTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h3 className="text-lg font-semibold">Material Management</h3>
          <p className="text-sm text-muted-foreground">
            Requests, approvals, materials for this project
          </p>
        </div>
      </div>

      <MaterialRequestListContainer projectId={String(projectId)} />
    </div>
  );
};